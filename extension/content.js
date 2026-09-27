/*  Travian Bot · content script (v3)
 *
 *  Corre en toda página de Travian, pero sólo TRABAJA si el service worker le
 *  dice que esta pestaña tiene un rol (tropas / heroe / farm / recursos).
 *  El rol va por tabId, así que sobrevive solo a cualquier navegación.
 *
 *  Todos los selectores de este archivo se verificaron a mano contra
 *  un servidor x5 de Travian Legends (UI "textButtonV2"), en septiembre de 2026.
 *  Los que NO pude verificar están marcados con "(sin verificar)".
 */

(function () {
  'use strict';

  /* ═══════════ 1 · utilidades ═══════════ */
  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  /* Chrome frena a UNA vuelta por minuto los timers ENCADENADOS (un setTimeout
     llamado desde otro, 5+ veces seguidas) de las pestañas ocultas hace más de
     5 min: un dormir(500) tardaba hasta 40 s (medido el 26/09). Un salto por
     MessageChannel corta la cadena: el setTimeout nace de un mensaje, no de
     otro timer, y queda en el freno común (≤1 s). Probé contar las esperas en
     el service worker y fue peor: con la PC cargada cada ida y vuelta tardaba
     5-20 s (los procesos de fondo de Chrome corren con prioridad Idle). */
  const dormir = ms => new Promise(res => {
    try {
      const ch = new MessageChannel();
      ch.port1.onmessage = () => { ch.port1.close(); setTimeout(res, ms); };
      ch.port2.postMessage(0);
    } catch (e) { setTimeout(res, ms); }
  });
  const azar   = (a, b) => Math.floor(a + Math.random() * (b - a));
  const ahora  = () => Date.now();
  const hhmm   = t => new Date(t).toLocaleTimeString('es-AR', { hour12: false });
  const num    = t => { const s = String(t == null ? '' : t).replace(/[^\d]/g, ''); return s ? parseInt(s, 10) : 0; };
  // el juego mete marcas bidi invisibles (U+202D etc.) alrededor de los números
  const txt    = e => (e && e.textContent ? e.textContent : '').replace(/[‎‏‪-‮]/g, '').replace(/\s+/g, ' ').trim();
  const cls    = e => String((e && e.className && e.className.baseVal !== undefined) ? e.className.baseVal : ((e && e.className) || ''));

  const q  = (lista, raiz) => { for (const s of lista) { const e = (raiz || document).querySelector(s); if (e) return e; } return null; };
  const qa = (lista, raiz) => { for (const s of lista) { const e = Array.from((raiz || document).querySelectorAll(s)); if (e.length) return e; } return []; };

  const bg = msg => new Promise(res => {
    try { chrome.runtime.sendMessage(msg, r => { void chrome.runtime.lastError; res(r || {}); }); }
    catch (e) { res({}); }
  });

  const ss = {
    get: k => { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) {} },
    del: k => { try { sessionStorage.removeItem(k); } catch (e) {} },
    json: (k, d) => { try { return JSON.parse(sessionStorage.getItem(k) || 'null') || d; } catch (e) { return d; } },
  };

  const NOMBRE    = { tropas: 'Tropas', heroe: 'Héroe', farm: 'Farm list', recursos: 'Construcción' };
  const RECURSO   = { 1: 'madera', 2: 'barro', 3: 'hierro', 4: 'cereal' };
  const MILITARES = [19, 20, 21, 29, 30];
  const GIDN      = { 19: 'Cuartel', 20: 'Establo', 21: 'Taller', 29: 'Gran cuartel', 30: 'Gran establo', 13: 'Herrería' };

  let ROL = null, CFG = null, INFO = null, bannerEl = null;
  let ocupado = false, T_INICIO = 0;
  let ultEstado = { txt: '—' };
  let NEXT = 0, RUN = false, despertador = 0;
  let NAVEGANDO = 0;          // cuándo pedí navegar: hasta que la página cambie, el bucle no vuelve a actuar
  const CARGADA = ahora();

  const log = m => bg({ tipo: 'log', m: String(m), rol: ROL });
  const estado = st => { ultEstado = st; return bg({ tipo: 'estado', rol: ROL, st: st }); };

  /* ═══════════ 2 · cadencia ═══════════
     El intervalo se cuenta desde que ARRANCÓ la vuelta. La próxima vuelta la
     dispara un meta refresh: Chrome frena los setTimeout de las pestañas en
     segundo plano, pero no el refresh del navegador. */
  /* sinRecarga: la próxima vuelta la dispara el bucle en ESTA misma página
     (la farm list queda abierta; recargarla cuesta 20-40 s con la PC cargada) */
  async function programar(seg, sinRecarga) {
    const s = Math.max(5, num(seg) || 69);
    return programarEn((T_INICIO || ahora()) + s * 1000, sinRecarga);
  }
  async function programarEn(objetivo, sinRecarga) {
    const ts = Math.max(ahora() + 3000, objetivo);
    NEXT = ts; RUN = true;
    await bg({ tipo: 'programar', rol: ROL, next: ts });
    // sinRecarga: la vuelta la dispara el bucle; el refresh queda sólo de respaldo, 20 s después
    recargarEn((ts - ahora()) / 1000 + (sinRecarga ? 20 : 0));
    return ts - ahora();
  }
  function recargarEn(seg) {
    const s = Math.max(4, Math.round(seg) - 1);
    try {
      const viejo = document.querySelector('meta[http-equiv="refresh"][data-tb]');
      if (viejo) viejo.remove();
      const m = document.createElement('meta');
      m.httpEquiv = 'refresh';
      m.setAttribute('data-tb', '1');
      m.content = String(s);
      (document.head || document.documentElement).appendChild(m);
    } catch (e) {}
    // respaldo por si el meta refresh no salta; uno solo por página
    clearTimeout(respaldoRecarga);
    respaldoRecarga = setTimeout(async () => { if ((await bg({ tipo: 'quienSoy' })).run) location.reload(); }, (s + 5) * 1000);
  }
  let respaldoRecarga = 0;
  function cancelarRecarga() {
    clearTimeout(respaldoRecarga);
    try { const m = document.querySelector('meta[http-equiv="refresh"][data-tb]'); if (m) m.remove(); } catch (e) {}
  }
  const rango = (r, def) => { const a = Array.isArray(r) ? r : def; const lo = Math.max(5, num(a[0]) || def[0]); return [lo, Math.max(lo, num(a[1]) || def[1])]; };
  const sortear = (r, def) => { const x = rango(r, def); return azar(x[0] * 1000, x[1] * 1000 + 1); };

  /* ═══════════ 3 · detectores ═══════════ */
  const textoPagina = () => { try { return (document.body ? document.body.innerText : '').slice(0, 3000); } catch (e) { return ''; } };

  function chequeoAntibot() {
    if ($('#botprotection') || $('.botProtection') || $('form[name="botprotection"]') || $('#bot_check')) return true;
    return /bot\s*protection|botschutz|protecci[oó]n\s*antibot/i.test(textoPagina());
  }
  function chequeoLogin() {
    if (/\/login\.php/.test(location.pathname)) return true;
    return !!$('form[name="login"] input[type="password"], #loginForm input[type="password"]') &&
           !$('#navigation, #sidebarBoxHero, #heroImageButton, #topBarHero');
  }
  const paginaVieja = ms => ahora() - CARGADA > (ms || 120000);

  function gidActual() {
    const b = $('#build');
    if (b) { const m = cls(b).match(/gid(\d+)/); if (m) return parseInt(m[1], 10); }
    const m2 = location.search.match(/[?&]gid=(\d+)/);
    return m2 ? parseInt(m2[1], 10) : 0;
  }
  const idSlotActual = () => { const m = location.search.match(/[?&]id=(\d+)/); return m ? m[1] : ''; };

  /* en qué aldea estoy. El newdid sólo viaja en la URL que armo yo; Travian lo
     saca al redirigir, así que lo recuerdo por pestaña. */
  /* id REAL de la aldea activa, tal como lo dibuja el servidor (verificado
     26/09): <input class="villageInput" data-did="22058"> en el recuadro del
     nombre y <div class="listEntry village active" data-did="22058"> en la
     lista lateral. Es la única verdad: el newdid de la URL es lo que PEDÍ. */
  function didActivo() {
    const e = $('input.villageInput[data-did]') || $('.listEntry.village.active[data-did]');
    return e ? String(e.getAttribute('data-did') || '') : '';
  }
  function didActual() {
    const d = didActivo();
    if (d) { ss.set('tb_did', d); return d; }
    const m = location.search.match(/[?&]newdid=(\d+)/);
    if (m) { ss.set('tb_did', m[1]); return m[1]; }
    return ss.get('tb_did') || '';
  }
  /* OJO: con la lista '.villageInput, #villageName' querySelector devolvía el
     <div id="villageName"> PADRE (va antes en el documento) y su texto es
     vacío: el nombre nunca se leía. El input va primero y solo. */
  function nombreAldeaActual() {
    const e = $('input.villageInput') || $('#villageNameField');
    return e ? ((e.value || txt(e)) || '').trim() : '';
  }
  const normNombre = s => String(s || '').replace(/\(.*?\)/g, '').replace(/\s+/g, ' ').trim().toLowerCase();

  /* ¿Estoy parado en esa aldea? Como vos jugás en el mismo navegador, la
     aldea activa puede cambiar debajo del bot: manda el data-did de la página. */
  function mismaAldea(did) {
    if (!did) return true;
    const act = didActivo();
    if (act) return act === String(did);
    const a = ((INFO && INFO.aldeas) || []).find(x => String(x.did) === String(did));
    const n = nombreAldeaActual();
    if (a && a.nombre && n) return normNombre(n) === normNombre(a.nombre);
    return didActual() === String(did);
  }

  const urlDorf1 = did => location.origin + '/dorf1.php' + (did ? '?newdid=' + did : '');
  const urlDorf2 = did => location.origin + '/dorf2.php' + (did ? '?newdid=' + did : '');
  const urlEdificio = (did, aid, gid) => location.origin + '/build.php?' + (did ? 'newdid=' + did + '&' : '') + (aid ? 'id=' + aid + '&' : '') + 'gid=' + gid;
  const urlSlot = (did, aid) => location.origin + '/build.php?' + (did ? 'newdid=' + did + '&' : '') + 'id=' + aid;
  const enDorf1 = () => /dorf1\.php/.test(location.pathname) || !!$('#resourceFieldContainer');
  const enDorf2 = () => /dorf2\.php/.test(location.pathname);

  /* Navegar es lo último que hace una carga: marco NAVEGANDO para que el
     bucle de 2 s no vuelva a navegar antes de que la página termine de cargar
     (eso reiniciaba la carga y gastaba los intentos), y espero a que el log
     llegue al service worker antes de irme. */
  function irA(url) {
    NAVEGANDO = ahora();
    cancelarRecarga();
    /* freno de bucles: el 27/09 a las 04:55 la pestaña del héroe pidió
       /hero/attributes 30 veces en 45 s (la página la mandaba a otro lado).
       Si pido la MISMA dirección 5 veces en 1 minuto sin quedarme ahí, paro
       esta pestaña 5 minutos: martillar el servidor es lo que delata un bot. */
    const destino = url.replace(location.origin, '').replace(/[?&]newdid=\d+/, '');
    const h = ss.json('tb_bucle', []).filter(x => ahora() - x.t < 60000);
    h.push({ u: destino, t: ahora() });
    ss.set('tb_bucle', JSON.stringify(h.slice(-10)));
    if (h.filter(x => x.u === destino).length >= 5) {
      ss.del('tb_bucle');
      NAVEGANDO = 0;
      bg({ tipo: 'log', m: '⚠ pedí ' + destino + ' 5 veces en 1 min y no llego: freno esta pestaña 5 min', rol: ROL });
      programarEn(ahora() + 300000);
      estado({ txt: 'frenada 5 min (no llegaba a ' + destino + ')' });
      return;
    }
    const ir = () => { location.href = url; };
    bg({ tipo: 'log', m: '→ ' + url.replace(location.origin, ''), rol: ROL }).then(ir, ir);
  }

  async function clic(el) {
    if (!el) return false;
    try { el.scrollIntoView({ block: 'center' }); } catch (e) {}
    await dormir(azar(180, 520));
    ['mouseover', 'mousedown', 'mouseup', 'click'].forEach(t => {
      el.dispatchEvent(new MouseEvent(t, { bubbles: true, cancelable: true, view: window }));
    });
    return true;
  }
  function escribir(input, valor) {
    if (!input) return;
    try {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(input, String(valor));
    } catch (e) { input.value = String(valor); }
    input.dispatchEvent(new Event('input',  { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }
  const botonApagado = b => !!b && (b.disabled || /\bdisabled\b|\bhidden\b/.test(cls(b)));
  function cerrarDialogo() { const c = $('.dialogCancelButton, .closeButton, #closeContentButton'); if (c) { try { c.click(); } catch (e) {} } }

  /* diagnóstico: si algo no se detecta guardo qué SÍ había en la página */
  async function guardarDiag(que, extra) {
    const cont = $('#build') || $('#content') || document.body;
    await bg({ tipo: 'diag', diag: {
      t: ahora(), que: que,
      url: location.pathname + location.search.replace(/newdid=\d+/, 'newdid=N'),
      gid: gidActual(), did: didActual(), aldea: nombreAldeaActual(),
      conteos: Object.assign({
        'input[name=t*]'  : $$('input[name]').filter(i => /^t\d+$/.test(i.name)).length,
        '.buildingSlot'   : $$('.buildingSlot').length,
        '.research'       : $$('.research').length,
        '.farmListWrapper': $$('.farmListWrapper').length,
        'button'          : $$('button').length,
      }, extra || {}),
      botones: $$('button').slice(0, 25).map(b => cls(b).slice(0, 50) + ' | ' + txt(b).slice(0, 25)),
      html: (cont ? cont.innerHTML : '').slice(0, 5000),
    } });
  }

  /* ═══════════ 4 · candado de aldea ═══════════
     Travian tiene UNA aldea activa por sesión y las 4 pestañas comparten la
     sesión. Si dos pestañas cambian de aldea a la vez, una puede actuar sobre
     la aldea equivocada. El service worker reparte un candado. */
  async function tomarAldea(did) {
    if (!did) return true;
    for (let i = 0; i < 10; i++) {
      const r = await bg({ tipo: 'lock', rol: ROL, did: String(did) });
      if (r && r.ok) return true;
      if (i === 0) estado({ txt: 'esperando a ' + (r && r.quien ? (NOMBRE[r.quien] || r.quien) : 'otra pestaña') });
      await dormir(1500);
    }
    return false;
  }
  const soltarAldea = () => bg({ tipo: 'unlock', rol: ROL });

  /* ═══════════ 5 · lectores de página (verificados) ═══════════ */

  const URL_ESTADISTICAS = '/village/statistics';
  const URL_PERFIL = '/profile';
  const enEstadisticas = () => /\/village\/statistics/.test(location.pathname);
  const enPerfil = () => /\/profile/.test(location.pathname);

  /* /village/statistics es la ÚNICA página con el newdid real de cada aldea.
     (El id del perfil, karte.php?d=…, es del mapa y NO sirve.) */
  function leerAldeasDeEstadisticas() {
    const vistas = {};
    $$('a[href]').forEach(a => {
      const m = (a.getAttribute('href') || '').match(/[?&]newdid=(\d+)/);
      if (!m) return;
      const did = m[1];
      const t = txt(a);
      const sirve = t && t.length <= 25 && !/^[•\s]*$/.test(t) && !/^\d+:\d+/.test(t);
      if (!vistas[did]) vistas[did] = { did, nombre: sirve ? t : '' };
      else if (sirve && !vistas[did].nombre) vistas[did].nombre = t;
    });
    return Object.values(vistas).map(a => ({ did: a.did, nombre: a.nombre || ('aldea ' + a.did) }));
  }

  /* el perfil trae la tribu de cada aldea (td.tribe i.tribeN_medium) */
  function leerTribusDelPerfil() {
    const t = $('table.villages');
    if (!t) return {};
    const out = {};
    Array.from(t.rows).slice(1).forEach(r => {
      const n = r.querySelector('.name');
      const ic = r.querySelector('.tribe [class*="tribe"], .tribe i');
      if (!n) return;
      const m = ic ? cls(ic).match(/tribe(\d+)/) : null;
      if (m) out[normNombre(txt(n))] = parseInt(m[1], 10);
    });
    return out;
  }

  /* dorf2: cada .buildingSlot trae data-aid (slot), data-gid, data-name, nivel
     en .labelLayer y el estado en la clase del <a> (good/notNow/maxLevel/
     underConstruction). gid 0 = slot vacío. */
  function leerSlotsDorf2() {
    return $$('.buildingSlot').map(s => {
      const c = cls(s);
      const aid = num(s.getAttribute('data-aid') || (c.match(/\baid(\d+)/) || [])[1] || (c.match(/\ba(\d+)\b/) || [])[1]);
      const gidA = s.getAttribute('data-gid');
      const gid = gidA != null ? num(gidA) : num((c.match(/\bg(\d+)\b/) || [])[1]);
      const a = s.querySelector('a');
      const ca = a ? cls(a) : '';
      return { aid, gid, nombre: s.getAttribute('data-name') || '', nivel: num(txt(s.querySelector('.labelLayer'))),
               estado: (ca.match(/good|maxLevel|notNow|underConstruction/g) || []).join('/') };
    }).filter(s => s.aid);
  }

  /* cuartel/establo/taller: un input t<N> por unidad, dentro de .details con
     img.unit.u<ID> (title = nombre) y el máximo entrenable como <a> numérico
     dentro de .cta ("Amount / 279"). OJO: los costos también son números, por
     eso el máximo se busca SÓLO en los <a>. */
  function filasDeTropa(raiz) {
    return $$('input[name]', raiz).filter(i => /^t\d+$/.test(i.name)).map(inp => {
      const t = parseInt(inp.name.slice(1), 10);
      const fila = inp.closest('.details, .troop, tr, li') || inp.parentElement.parentElement || inp.parentElement;
      const img = fila.querySelector('img.unit');
      const u = img ? num((cls(img).match(/\bu(\d+)/) || [])[1]) : 0;
      let nombre = img ? (img.getAttribute('title') || img.getAttribute('alt') || '') : '';
      if (!nombre) {
        for (const c of Array.from(fila.querySelectorAll('a, .tit'))) {
          const v = txt(c); if (v && v.length > 1 && !/^\(?[\d.,\s]+\)?$/.test(v)) { nombre = v; break; }
        }
      }
      let max = 0;
      const cta = fila.querySelector('.cta') || fila;
      for (const a of Array.from(cta.querySelectorAll('a'))) { const v = txt(a); if (/^\d{1,6}$/.test(v)) { max = num(v); break; } }
      if (!max) for (const a of Array.from(fila.querySelectorAll('a'))) { const v = txt(a); if (/^\d{1,6}$/.test(v)) { max = num(v); break; } }
      return { t, u, nombre: nombre || ('unidad ' + t), max, input: inp };
    });
  }
  // el botón "Train" es button.green.startTraining#s1 (verificado)
  const botonEntrenar = () => q(['button.startTraining', '#s1', 'button.green[type="submit"]', 'form button[type="submit"]', 'input[type="submit"]']);

  /* herrería: filas .research con img.unit.u<ID>, "Level N" y dos botones:
     el verde "Improve" (recursos) y el violeta "Improve 25% fast" (oro). */
  function filasDeHerreria() {
    return $$('.research').map(r => {
      const img = r.querySelector('img.unit');
      const u = img ? num((cls(img).match(/\bu(\d+)/) || [])[1]) : 0;
      const nombre = img ? (img.getAttribute('title') || img.getAttribute('alt') || '') : txt(r.querySelector('.title'));
      const m = txt(r).match(/(?:level|nivel|stufe|n[ií]vel)\s*(\d+)/i);
      const btn = Array.from(r.querySelectorAll('button')).find(b => /green/.test(cls(b)) && !/purple|gold|videoFeature/.test(cls(b))) || null;
      return { u, nombre: nombre || ('unidad ' + u), nivel: m ? parseInt(m[1], 10) : 0, btn, activo: !!btn && !botonApagado(btn) };
    }).filter(x => x.u);
  }

  /* dorf1: campos gid 1..4 como <a class="... gidN buildingSlotN good|notNow|maxLevel"> */
  function leerCampos() {
    const cont = $('#resourceFieldContainer') || $('#village_map') || document;
    return $$('a[href*="build.php"]', cont).map(a => {
      const c = cls(a);
      const mid = (a.getAttribute('href') || '').match(/[?&]id=(\d+)/);
      const mg = c.match(/\bgid(\d+)/);
      if (!mid || !mg) return null;
      const gid = parseInt(mg[1], 10);
      if (gid < 1 || gid > 4) return null;
      const lab = a.querySelector('.labelLayer, .level');
      return { id: mid[1], gid, nivel: num(lab ? txt(lab) : txt(a)),
               estado: (c.match(/good|maxLevel|notNow|underConstruction/g) || []).join('/') };
    }).filter(Boolean);
  }

  /* barra de recursos: #l1..#l4 (valores), .stockBarButton.resourceN .bar
     (ancho en %), .warehouse / .granary (el primer número es la capacidad) */
  function leerStock() {
    const cur = [1, 2, 3, 4].map(i => num(txt($('#l' + i))));
    const pct = [1, 2, 3, 4].map(i => { const b = $('.stockBarButton.resource' + i + ' .bar'); return b && b.style ? (parseFloat(b.style.width) || 0) : 0; });
    const capW = num((txt($('.warehouse')).match(/[\d.,]+/) || [''])[0]);
    const capG = num((txt($('.granary')).match(/[\d.,]+/) || [''])[0]);
    return { cur, pct, capW, capG };
  }

  /* botón verde de ampliar/mejorar de un edificio o campo — NUNCA el dorado
     ("master builder") ni el violeta ("25% faster") */
  function botonMejorar() {
    const cands = $$('.upgradeButtonsContainer button, .section1 button, button.build, button.contracting, .contractLink button');
    const ok = cands.find(b => /green/.test(cls(b)) && !/gold|purple|videoFeature|exchange|builder/.test(cls(b)));
    if (ok) return ok;
    const rx = /upgrade|ampliar|mejorar|ausbauen|construir|improve|build/i;
    return $$('button').find(b => rx.test(txt(b)) && /green/.test(cls(b)) && !/gold|purple|videoFeature|exchange|builder/.test(cls(b))) || null;
  }
  // "Complete construction immediately" (dorado, cuesta oro) — verificado el botón, no el diálogo
  const botonOroTerminar = () => $$('button').find(b => /gold/.test(cls(b)) && !/productionBoost|exchange|builder/.test(cls(b)) && /complete|finali|termin|fertig|instant/i.test(txt(b))) || null;
  // "Exchange resources" (dorado): abre el diálogo del NPC (verificado)
  const botonExchange = () => $$('button').find(b => /\bexchange\b/.test(cls(b)) || /exchange resources|intercambiar recursos/i.test(txt(b))) || null;

  /* farm list: .farmListWrapper → .farmListName + button.startFarmList
     ("Start (19)"); la que no tiene objetivos viene con clase "disabled".
     Desde el 26/09 SÍ existe button.startAllFarmLists ("Start all farm
     lists"). React la dibuja después de cargar. */
  async function listasFarm() {
    let ws = $$('.farmListWrapper');
    for (let i = 0; i < 10 && !ws.length; i++) { await dormir(1000); ws = $$('.farmListWrapper'); }
    if (!ws.length) {
      $$('.secondaryIconButton.expand, button.expand').forEach(b => { try { b.click(); } catch (e) {} });
      await dormir(1200);
      ws = $$('.farmListWrapper');
    }
    if (!ws.length) ws = qa(['div.raidList', '[class*="raidList"]']);
    return ws.map(w => ({
      nombre: txt(w.querySelector('.farmListName, .listTitleText, .listName')) || '(sin nombre)',
      btn: q(['button.startFarmList', '.startFarmList', 'button[value="ok"]'], w),
    })).filter(x => x.btn);
  }

  /* ═══════════ 6 · ESCANEO ═══════════
     statistics (aldeas + newdid) → profile (tribu) → por aldea: dorf2 (todos
     los edificios con slot y nivel) → cuartel/establo/taller (unidades) →
     herrería (mejoras). Es lo que llena el panel. */
  async function pasoEscaneo(info) {
    let scan = info.scan || {};

    if (!scan.pend) {
      if (!scan.general) {
        if (!enEstadisticas()) { estado({ txt: 'buscando aldeas' }); irA(location.origin + URL_ESTADISTICAS); return; }
        const lista = leerAldeasDeEstadisticas();
        if (!lista.length) {
          await guardarDiag('escaneo: statistics sin aldeas');
          log('no encuentro tus aldeas — mandame el diagnóstico del panel');
          await bg({ tipo: 'scan', scan: { activo: false } });
          return;
        }
        scan.general = lista;
        await bg({ tipo: 'scan', scan });
        log('encontré ' + lista.length + ' aldeas');
        return;
      }
      if (!scan.tribus) {
        if (!enPerfil()) { estado({ txt: 'viendo tribus' }); irA(location.origin + URL_PERFIL); return; }
        const tr = leerTribusDelPerfil();
        scan.general = scan.general.map(a => (tr[normNombre(a.nombre)] ? Object.assign({}, a, { tribu: tr[normNombre(a.nombre)] }) : a));
        scan.tribus = 1;
      }
      const aldeas = scan.general;
      await bg({ tipo: 'aldeas', aldeas });
      INFO.aldeas = aldeas;
      scan = { activo: true, pend: aldeas.map(a => ({ did: String(a.did), fase: 'dorf2' })), total: aldeas.length, unid: {}, edif: {}, herr: {} };
      await bg({ tipo: 'scan', scan });
      log('escaneo: ' + aldeas.length + ' aldeas, edificio por edificio');
    }

    if (!scan.pend.length) {
      await bg({ tipo: 'unidades', unidades: scan.unid || {} });
      await bg({ tipo: 'edificios', edificios: scan.edif || {} });
      await bg({ tipo: 'herreria', herreria: scan.herr || {} });
      await bg({ tipo: 'scan', scan: { activo: false, listo: ahora() } });
      await soltarAldea();
      log('escaneo terminado: ' + Object.keys(scan.edif || {}).length + ' aldeas, ' +
          Object.values(scan.unid || {}).filter(v => v.length).length + ' edificios con tropa');
      estado({ txt: 'escaneo listo', ult: hhmm(ahora()) });
      await programarEn(ahora() + 4000);
      return;
    }

    const paso = scan.pend[0];
    const hecho = scan.total - scan.pend.length;
    const guardar = () => bg({ tipo: 'scan', scan });
    const siguienteAldea = async () => {
      scan.pend.shift();
      await guardar();
      await soltarAldea();
      if (scan.pend.length) irA(urlDorf2(scan.pend[0].did));
      else await programarEn(ahora() + 2000);
    };

    if (!(await tomarAldea(paso.did))) { await programarEn(ahora() + 8000); return; }

    if (paso.fase === 'dorf2') {
      if (!enDorf2() || !mismaAldea(paso.did)) {
        paso.intentos = (paso.intentos || 0) + 1;
        if (paso.intentos > 3) { log('no llego a la aldea ' + paso.did + ', la salteo'); await siguienteAldea(); return; }
        await guardar(); irA(urlDorf2(paso.did)); return;
      }
      const slots = leerSlotsDorf2();
      scan.edif[paso.did] = slots;
      const nom = nombreAldeaActual();
      if (nom) await bg({ tipo: 'aldeaNombre', did: paso.did, nombre: nom });
      estado({ txt: 'escaneando ' + (hecho + 1) + '/' + scan.total + ' ' + (nom || '') });
      paso.cola = slots.filter(s => MILITARES.indexOf(s.gid) >= 0 || s.gid === 13).map(s => ({ aid: s.aid, gid: s.gid }));
      paso.fase = 'edificios';
      await guardar();
      if (!paso.cola.length) { await siguienteAldea(); return; }
      irA(urlEdificio(paso.did, paso.cola[0].aid, paso.cola[0].gid));
      return;
    }

    // fase 'edificios': recorro cuartel/establo/taller/herrería de esta aldea
    const e = paso.cola[0];
    if (gidActual() !== e.gid || !mismaAldea(paso.did)) {
      if (e.visto) {
        log((GIDN[e.gid] || 'gid' + e.gid) + ' @' + paso.did + ': no abre, lo salteo');
        paso.cola.shift(); await guardar();
        if (paso.cola.length) irA(urlEdificio(paso.did, paso.cola[0].aid, paso.cola[0].gid)); else await siguienteAldea();
        return;
      }
      e.visto = 1; await guardar();
      irA(urlEdificio(paso.did, e.aid, e.gid));
      return;
    }
    if (e.gid === 13) {
      const f = filasDeHerreria();
      scan.herr[paso.did] = f.map(x => ({ u: x.u, nombre: x.nombre, nivel: x.nivel }));
      if (f.length) log('Herrería @' + paso.did + ': ' + f.map(x => x.nombre + ' nv' + x.nivel).join(', '));
    } else {
      const f = filasDeTropa();
      scan.unid[paso.did + '|' + e.gid] = f.map(x => ({ t: x.t, u: x.u, nombre: x.nombre }));
      if (f.length) log((GIDN[e.gid] || 'gid' + e.gid) + ' @' + paso.did + ': ' + f.map(x => x.nombre).join(', '));
      else await guardarDiag('escaneo: ' + (GIDN[e.gid] || e.gid) + ' sin inputs');
    }
    paso.cola.shift(); await guardar();
    await dormir(azar(400, 900));
    if (paso.cola.length) irA(urlEdificio(paso.did, paso.cola[0].aid, paso.cola[0].gid)); else await siguienteAldea();
  }

  /* ═══════════ 7 · TROPAS ═══════════ */

  const claveUnid = (did, gid) => (did || 'x') + '|' + gid;
  const slotDe = (did, gid) => ((INFO && INFO.edificios && INFO.edificios[did]) || []).find(s => s.gid === gid);

  function edificioPlan(c, did, gid) {
    const e = (c.plan[did] || {})[gid];
    if (!e || !e.u || !e.u.length) return null;
    return { cada: rango(e.cada, c.cada || [60, 90]), u: e.u };
  }
  function aldeasElegidas(c, conocidas) {
    if (Array.isArray(c.aldeas) && c.aldeas.length) return c.aldeas.map(String);
    const d = (conocidas || []).map(a => String(a.did));
    return d.length ? d : [''];
  }
  function proximoTurno(c, dids, nextu, T) {
    let min = Infinity;
    dids.forEach(did => Object.keys(c.plan[did] || {}).forEach(gid => {
      if (!edificioPlan(c, did, gid)) return;
      const v = nextu[claveUnid(did, gid)] || T;
      if (v < min) min = v;
    }));
    return (min === Infinity) ? T + 60000 : min;
  }

  async function entrenar(did, gid, pedir) {
    const filas = filasDeTropa();
    if (!filas.length) { log((GIDN[gid] || 'gid' + gid) + ' @' + did + ': no encuentro el formulario'); await guardarDiag('tropas: sin formulario'); return []; }
    const mandadas = [];
    pedir.forEach(p => {
      const u = filas.find(x => x.t === p.t);
      if (!u) return;
      let cant;
      if (p.usarMax) cant = u.max;
      else { const lo = Math.max(1, num(p.min) || 1); const hi = Math.max(lo, num(p.max) || lo); cant = Math.min(azar(lo, hi + 1), u.max); }
      if (!cant || cant < 1) { log('sin recursos para ' + u.nombre + ' @' + did); return; }
      escribir(u.input, cant);
      mandadas.push(p);
      log((GIDN[gid] || 'gid' + gid) + ' @' + did + ': ' + cant + ' × ' + u.nombre);
    });
    if (!mandadas.length) return [];
    const btn = botonEntrenar();
    if (!btn) { log('no encuentro el botón Train'); await guardarDiag('tropas: sin botón'); return []; }
    await clic(btn);
    await dormir(azar(900, 1800));
    return mandadas;
  }

  /* ── Entrenar SIN navegar (v3.5) ──
     El formulario del cuartel (form[name=snd]: action=trainTroops, checksum,
     s, did, t1..tN, botón s1=ok) lleva el id de la aldea adentro, así que se
     puede mandar por fetch: GET del edificio + POST del formulario, sin cargar
     ni dibujar páginas. Con la PC cargada cada página costaba 10-40 s y Travian
     además recarga solo el cuartel al terminar cada unidad; la ronda por los
     18 edificios no llegaba antes de que se vaciaran las colas. */
  async function traerDoc(url, opciones) {
    const r = await fetch(url, Object.assign({ credentials: 'include' }, opciones || {}));
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return new DOMParser().parseFromString(await r.text(), 'text/html');
  }
  // filas de la cola de entrenamiento ("6 Mercenaries 0:05:09 17:19")
  const filasCola = d => $$('table.under_progress tr, .under_progress tr', d).filter(tr => /\d+:\d\d:\d\d/.test(txt(tr))).length;

  /* devuelve { r: 'ok' | 'sinconf' | 'sinrec' | 'error', m } */
  async function entrenarPorFetch(did, gid, pedir) {
    const nom = GIDN[gid] || 'gid' + gid;
    const s = slotDe(did, gid);
    const d = await traerDoc(urlEdificio(did, s ? s.aid : '', gid));
    if ($('#botprotection, .botProtection, form[name="botprotection"], #bot_check', d)) return { r: 'antibot' };
    if ($('input[type="password"]', d) && !$('#navigation, #sidebarBoxHero, #topBarHero, input.villageInput', d)) return { r: 'login' };
    const b = $('#build', d);
    const gidDoc = b ? num((cls(b).match(/gid(\d+)/) || [])[1]) : 0;
    const form = $('form[name="snd"]', d) || (($('button.startTraining', d) || {}).closest ? $('button.startTraining', d).closest('form') : null);
    if (!form || gidDoc !== gid) return { r: 'error', m: 'no abre el ' + nom + ' (gid ' + gidDoc + ')' };
    const didForm = $('input[name="did"]', form);
    if (didForm && String(didForm.value) !== String(did)) return { r: 'error', m: 'la aldea activa cambió (' + didForm.value + ')' };

    const filas = filasDeTropa(form);
    const cant = {};
    const partes = [];
    pedir.forEach(p => {
      const u = filas.find(x => x.t === p.t);
      if (!u) return;
      let n;
      if (p.usarMax) n = u.max;
      else { const lo = Math.max(1, num(p.min) || 1); const hi = Math.max(lo, num(p.max) || lo); n = Math.min(azar(lo, hi + 1), u.max); }
      if (!n || n < 1) { log('sin recursos para ' + u.nombre + ' @' + did); return; }
      cant[u.t] = n;
      partes.push(n + ' × ' + u.nombre);
    });
    if (!partes.length) return { r: 'sinrec' };

    const datos = new URLSearchParams();
    $$('input[name]', form).forEach(i => {
      if (/^t\d+$/.test(i.name)) return;
      if ((i.type === 'checkbox' || i.type === 'radio') && !i.checked) return;
      datos.append(i.name, i.value);
    });
    filas.forEach(f => datos.append('t' + f.t, String(cant[f.t] || 0)));
    const btn = $('button[name]', form);
    datos.append(btn ? btn.name : 's1', btn ? (btn.value || 'ok') : 'ok');

    const antes = filasCola(d);
    await dormir(azar(400, 900));
    const destino = new URL(form.getAttribute('action') || '/build.php', location.origin + '/build.php').href;
    const d2 = await traerDoc(destino, { method: 'POST', body: datos });
    const despues = filasCola(d2);
    return { r: despues > antes ? 'ok' : 'sinconf', m: nom + ' @' + did + ': ' + partes.join(', ') };
  }

  const hayPlanTropas = (c, dids) => dids.some(d => Object.keys(c.plan[d] || {}).some(g => edificioPlan(c, d, g)));

  /* Modo de Tropas. 'iconos' (por defecto, lo pidió el usuario el 26/09):
     entra como una persona, con la lista de aldeas y los íconos verdes del
     recuadro de la aldea activa. 'directo': fetch del formulario, sin navegar
     (más rápido con la PC cargada). */
  async function pasoTropas(info) {
    const modo = (CFG.tropas && CFG.tropas.modo) || 'iconos';
    if (modo === 'directo' && ss.get('tb_tropas_iconos') !== '1') return pasoTropasDirecto(info);
    return pasoTropasIconos(info);
  }

  /* ── Por íconos ──
     Recuadro de la derecha (#sidebarBoxActiveVillage), arriba de Population y
     Loyalty: 4 íconos a.layoutButton verdes → mercado, cuartel
     (build.php?gid=19), establo (gid=20) y taller (gid=21) de la aldea activa.
     Para cambiar de aldea: clic en su renglón de la lista de aldeas
     (.listEntry.village[data-did]). Cada clic carga una página nueva, así que
     el avance vive en sessionStorage ('tb_cola') y cada carga hace UN paso. */
  const iconoEdificio = gid => {
    const box = $('#sidebarBoxActiveVillage') || document;
    const rx = new RegExp('[?&]gid=' + gid + '(?!\\d)');
    return $$('a.layoutButton', box).find(a => rx.test(a.getAttribute('href') || '')) || null;
  };
  const iconoVerde = a => !!a && /\bgreen\b/.test(cls(a)) && !/\b(grey|gray|disabled)\b/.test(cls(a));
  const renglonAldea = did => $('.listEntry.village[data-did="' + did + '"] a') || $('.listEntry.village[data-did="' + did + '"]');
  const nombreDe = did => { const a = ((INFO && INFO.aldeas) || []).find(x => String(x.did) === String(did)); return a && a.nombre ? a.nombre : did; };

  /* /village/statistics/troops/training: una fila por aldea (por nombre) y
     una columna por edificio (clase typeNN en el encabezado). "•" = nada
     entrenándose, "-" = no existe, "h:mm:ss" = lo que falta. Devuelve
     { did: { gid: segundos (0 vacío, -1 no existe) } } */
  async function colasEntrenamiento() {
    const d = await traerDoc(location.origin + '/village/statistics/troops/training');
    const t = $$('table', $('#content', d) || d).pop();
    if (!t || t.rows.length < 2) return null;
    const cols = Array.from(t.rows[0].cells).map(c => { const i = c.querySelector('[class*="type"]'); const m = i ? cls(i).match(/\btype(\d+)/) : null; return m ? parseInt(m[1], 10) : 0; });
    const porNombre = {};
    Array.from(t.rows).slice(1).forEach(r => {
      const celdas = Array.from(r.cells);
      const v = {};
      celdas.forEach((c, i) => {
        if (!cols[i]) return;
        const s = txt(c);
        const m = s.match(/(\d+):(\d\d):(\d\d)/);
        v[cols[i]] = m ? parseInt(m[1], 10) * 3600 + parseInt(m[2], 10) * 60 + parseInt(m[3], 10) : (s === '-' ? -1 : 0);
      });
      porNombre[normNombre(txt(celdas[0]))] = v;
    });
    const out = {};
    ((INFO && INFO.aldeas) || []).forEach(a => { const v = porNombre[normNombre(a.nombre)]; if (v) out[String(a.did)] = v; });
    return Object.keys(out).length ? out : null;
  }

  /* Completa las cantidades en el cuartel abierto y manda ESE formulario por
     fetch (lo mismo que "Train", sin la recarga extra); confirma que la cola
     creció. Si el envío falla, aprieta "Train" de verdad. */
  async function entrenarEnPagina(did, gid, pedir) {
    const nom = GIDN[gid] || 'gid' + gid;
    const filas = filasDeTropa();
    if (!filas.length) { log(nom + ' @' + did + ': no encuentro el formulario'); await guardarDiag('tropas: sin formulario'); return 'nada'; }
    const partes = [];
    pedir.forEach(p => {
      const u = filas.find(x => x.t === p.t);
      if (!u) { log(nom + ' @' + did + ': no veo la unidad t' + p.t + ' en el formulario (hay: ' + filas.map(f => 't' + f.t).join(', ') + ')'); return; }
      let n;
      if (p.usarMax) n = u.max;
      else { const lo = Math.max(1, num(p.min) || 1); const hi = Math.max(lo, num(p.max) || lo); n = Math.min(azar(lo, hi + 1), u.max); }
      if (!n || n < 1) { log('sin recursos para ' + u.nombre + ' @' + did); return; }
      escribir(u.input, n);
      partes.push(n + ' × ' + u.nombre);
    });
    if (!partes.length) return 'nada';
    const form = filas[0].input.form || filas[0].input.closest('form');
    const btn = botonEntrenar();
    try {
      if (!form) throw new Error('sin formulario');
      const datos = new URLSearchParams(new FormData(form));
      if (btn && btn.name && !datos.has(btn.name)) datos.append(btn.name, btn.value || 'ok');
      await dormir(azar(300, 700));
      const antes = filasCola(document);
      const d2 = await traerDoc(new URL(form.getAttribute('action') || location.href, location.href).href, { method: 'POST', body: datos });
      const despues = filasCola(d2);
      filas.forEach(f => escribir(f.input, ''));   // que nadie lo mande dos veces con "Train"
      log(nom + ' @' + did + ': ' + partes.join(', ') + (despues > antes ? ' ✔' : ' (mandado, la cola no cambió a la vista)'));
      return 'ok';
    } catch (e) {
      log(nom + ' @' + did + ': envío directo falló (' + (e && e.message ? e.message : e) + '), aprieto Train');
      if (!btn) return 'nada';
      log(nom + ' @' + did + ': ' + partes.join(', '));
      await clic(btn);
      return 'clic';
    }
  }

  async function clicQueNavega(el, que) {
    NAVEGANDO = ahora();
    cancelarRecarga();
    await bg({ tipo: 'log', m: '→ ' + que, rol: ROL });
    await clic(el);
  }

  async function pasoTropasIconos(info) {
    const c = CFG.tropas;
    const nextu = Object.assign({}, info.nextu || {});
    const dids = aldeasElegidas(c, info.aldeas);

    let cola = ss.json('tb_cola', []);
    if (!cola.length) {
      const r = await armarRondaPorCola(c, dids);
      if (!r) {
        await soltarAldea();
        const hay = hayPlanTropas(c, dids);
        if (!hay) log('no hay tropas elegidas — tildá qué entrenar en el panel');
        const ms = await programarEn(ahora() + (hay ? sortear(c.cada, [60, 90]) : 60000));
        estado({ txt: hay ? 'todas las colas con más de 24 h' : 'sin plan', next: ahora() + ms, ult: hhmm(ahora()) });
        if (!/^\/profile/.test(location.pathname)) irA(location.origin + '/profile');
        return;
      }
      cola = r.cola;
      ss.set('tb_cola', JSON.stringify(cola));
      try { Object.keys(sessionStorage).filter(x => /^tb_(ico|int)_/.test(x)).forEach(x => sessionStorage.removeItem(x)); } catch (e) {}
    }
    const guardarCola = () => ss.set('tb_cola', JSON.stringify(cola));

    // cada vuelta de este for es un edificio que se resuelve SIN cambiar de página
    for (let i = 0; i < 40 && cola.length; i++) {
      const p = cola[0];
      const nom = GIDN[p.gid] || 'gid' + p.gid;
      const k = claveUnid(p.did, p.gid);
      const kInt = 'tb_ico_' + p.did + '_' + p.gid;   // contador propio: los 'tb_int_' viejos quedaban a medias
      const saltar = motivo => {
        log(motivo);
        nextu[k] = ahora() + 600000; bg({ tipo: 'nextu', nextu });
        cola.shift(); guardarCola(); ss.del(kInt);
      };

      if (!(await tomarAldea(p.did))) {
        const ms = await programarEn(ahora() + 10000);
        estado({ txt: 'esperando turno', next: ahora() + ms });
        return;
      }
      bg({ tipo: 'trabajando', rol: ROL });
      estado({ txt: nom + ' de ' + nombreDe(p.did) + ' (' + cola.length + ' por hacer)' });
      const intentos = parseInt(ss.get(kInt) || '0', 10);

      // 1 · la aldea: clic en su nombre, en la lista de aldeas de la derecha
      if (!mismaAldea(p.did)) {
        if (intentos >= 3) { saltar('no llego a la aldea ' + nombreDe(p.did) + ', salteo su ' + nom + ' 10 min'); continue; }
        ss.set(kInt, String(intentos + 1));
        const r = renglonAldea(p.did);
        if (r && intentos < 2) { await clicQueNavega(r, 'aldea ' + nombreDe(p.did)); return; }
        irA(urlDorf2(p.did)); return;                                   // respaldo: por URL
      }

      // 2 · el edificio: clic en su ícono verde (mercado · cuartel · establo · taller)
      if (gidActual() !== p.gid) {
        if (intentos >= 3) { saltar('no llego al ' + nom + ' de ' + nombreDe(p.did) + ', lo salteo 10 min'); continue; }
        ss.set(kInt, String(intentos + 1));
        // el recuadro con los íconos lo dibuja React DESPUÉS de cargar: lo espero hasta 6 s
        let ico = iconoEdificio(p.gid);
        for (let k = 0; k < 12 && !iconoVerde(ico); k++) { await dormir(500); ico = iconoEdificio(p.gid); }
        if (iconoVerde(ico) && intentos < 2) { await clicQueNavega(ico, nom + ' de ' + nombreDe(p.did) + ' (ícono)'); return; }
        const s = slotDe(p.did, p.gid);                                  // respaldo: por URL del slot
        irA(urlEdificio(p.did, s ? s.aid : '', p.gid)); return;
      }
      ss.del(kInt);
      if (paginaVieja()) { location.reload(); return; }

      // 3 · completar y "Train". El avance se guarda ANTES: el botón recarga la página.
      const ed = edificioPlan(c, p.did, p.gid);
      nextu[k] = ahora() + sortear(ed ? ed.cada : null, c.cada || [60, 90]);
      bg({ tipo: 'nextu', nextu });
      cola.shift(); guardarCola();
      const res = ed ? await entrenarEnPagina(p.did, p.gid, ed.u) : 'nada';
      if (res === 'clic') { NAVEGANDO = ahora(); return; }              // apretó "Train": la página se recarga
      await dormir(azar(600, 1200));                                    // sigo acá mismo con el próximo ícono
    }

    if (!cola.length) {
      await soltarAldea();
      // vuelta terminada: pausa para juntar recursos y vuelvo a leer las colas
      const ms = await programarEn(ahora() + sortear(c.cada, [60, 90]));
      estado({ txt: 'vuelta terminada', next: ahora() + ms, ult: hhmm(ahora()) });
      log('tropas · vuelta terminada, vuelvo a mirar las colas en ' + Math.round(ms / 1000) + ' s');
      if (!/^\/profile/.test(location.pathname)) irA(location.origin + '/profile');
    }
  }

  /* Prioridad por cola (pedido del usuario el 27/09, reemplaza a las rondas
     cuartel→establo→taller): cada vuelta lee los tiempos de
     /village/statistics/troops/training y
       · de cada aldea entra a UN SOLO edificio: el que tenga menos cola o
         esté vacío (así no se pasea por todos; los recursos de la aldea van a
         ese). Los otros esperan a la próxima vuelta.
       · empieza por la aldea cuyo edificio elegido tenga menos cola.
     Saltea los que tienen más de 3 h de cola; si TODOS pasan de 3 h, el límite
     sube a 6, 9, … hasta 24 h. Una cola que no se pudo leer cuenta como vacía. */
  const TIPO = { 19: 'Cuartel', 29: 'Gran cuartel', 20: 'Establo', 30: 'Gran establo', 21: 'Taller' };
  const fmtCola = s => s == null ? '?' : s <= 0 ? 'vacío' : s < 3600 ? Math.round(s / 60) + ' min' : (s / 3600).toFixed(1) + ' h';
  async function armarRondaPorCola(c, dids) {
    let colas = null;
    try { colas = await colasEntrenamiento(); } catch (e) {}
    if (!colas) log('tropas: no pude leer las colas de entrenamiento, voy a todos');
    const cands = [];
    dids.forEach(did => [19, 29, 20, 30, 21].forEach(gid => {
      if (!edificioPlan(c, did, gid)) return;
      const s = colas && colas[String(did)] ? colas[String(did)][gid] : null;
      if (s === -1) return;                                     // la aldea no tiene ese edificio
      cands.push({ did: String(did), gid, s: s == null ? 0 : s });
    }));
    if (!cands.length) return null;
    let umbral = 3, sel = [];
    for (; umbral <= 24; umbral += 3) {
      sel = cands.filter(x => x.s <= umbral * 3600);
      if (sel.length) break;
    }
    if (!sel.length) { log('tropas: todos los edificios tienen más de 24 h de cola'); return null; }
    // aldeas ordenadas por su edificio más vacío; adentro, de menos a más cola
    const porAldea = {};
    sel.forEach(x => { (porAldea[x.did] = porAldea[x.did] || []).push(x); });
    const aldeas = Object.keys(porAldea).map(did => {
      const eds = porAldea[did].sort((a, b) => a.s - b.s || a.gid - b.gid);
      return { did, eds, min: eds[0].s };
    }).sort((a, b) => a.min - b.min || dids.indexOf(a.did) - dids.indexOf(b.did));
    const salteados = cands.filter(x => sel.indexOf(x) < 0).map(x => nombreDe(x.did) + ' ' + TIPO[x.gid] + ' ' + fmtCola(x.s));
    log('tropas · por cola: ' + aldeas.map(a => nombreDe(a.did) + ' ' + TIPO[a.eds[0].gid] + ' ' + fmtCola(a.eds[0].s)).join(' → ') +
        (umbral > 3 ? ' [todos tenían más de ' + (umbral - 3) + ' h: límite ' + umbral + ' h]' : '') +
        (salteados.length ? ' — salteo: ' + salteados.join(', ') : ''));
    const cola = [];
    aldeas.forEach(a => cola.push({ did: a.eds[0].did, gid: a.eds[0].gid }));   // uno por aldea
    return { cola };
  }

  /* ── Directo (fetch, sin navegar): ver entrenarPorFetch ── */
  async function pasoTropasDirecto(info) {
    const c = CFG.tropas;
    const nextu = Object.assign({}, info.nextu || {});
    const T = ahora();
    const dids = aldeasElegidas(c, info.aldeas);

    const due = [];
    dids.forEach(did => Object.keys(c.plan[did] || {}).forEach(gid => {
      if (!edificioPlan(c, did, gid)) return;
      const v = nextu[claveUnid(did, gid)] || 0;
      if (v <= T) due.push({ did: String(did), gid: parseInt(gid, 10), v });
    }));
    if (!due.length) {
      const hayPlan = dids.some(d => Object.keys(c.plan[d] || {}).some(g => edificioPlan(c, d, g)));
      if (!hayPlan) {
        log('no hay tropas elegidas — tildá qué entrenar en el panel');
        const ms = await programarEn(ahora() + 60000);
        estado({ txt: 'sin plan', next: ahora() + ms });
        return;
      }
      const ms = await programarEn(proximoTurno(c, dids, nextu, T));
      estado({ txt: 'esperando', next: ahora() + ms, ult: hhmm(ahora()) });
      return;
    }
    // el más atrasado primero, y los edificios de una misma aldea juntos
    due.sort((a, b) => a.v - b.v);
    const orden = [], vista = {};
    due.forEach(x => { if (vista[x.did]) return; vista[x.did] = 1; due.filter(y => y.did === x.did).forEach(y => orden.push(y)); });

    cancelarRecarga();
    estado({ txt: 'entrenando (' + orden.length + ' edificios)' });
    let ok = 0, sinconf = 0, errores = 0, didLock = null, cortado = false;
    for (const p of orden) {
      if (p.did !== didLock) {
        if (didLock !== null) await soltarAldea();
        didLock = null;
        if (!(await tomarAldea(p.did))) { cortado = true; break; }   // es el turno de otra pestaña
        didLock = p.did;
      }
      bg({ tipo: 'trabajando', rol: ROL });
      const ed = edificioPlan(c, p.did, p.gid);
      nextu[claveUnid(p.did, p.gid)] = ahora() + sortear(ed.cada, c.cada || [60, 90]);
      bg({ tipo: 'nextu', nextu });
      let res;
      try { res = await entrenarPorFetch(p.did, p.gid, ed.u); }
      catch (e) { res = { r: 'error', m: (GIDN[p.gid] || 'gid' + p.gid) + ' @' + p.did + ': ' + (e && e.message ? e.message : e) }; }
      if (res.r === 'antibot') { await bg({ tipo: 'alarma', m: 'Captcha / control antibot en Tropas' }); return; }
      if (res.r === 'login')   { await bg({ tipo: 'alarma', m: 'Sesión cerrada en Tropas' }); return; }
      if (res.r === 'ok') { ok++; log(res.m + ' ✔'); }
      else if (res.r === 'sinconf') { sinconf++; log(res.m + ' (mandado, la cola no cambió a la vista)'); }
      else if (res.r === 'error') {
        errores++; log(res.m);
        nextu[claveUnid(p.did, p.gid)] = ahora() + 20000;   // reintento pronto
        bg({ tipo: 'nextu', nextu });
      }
      await dormir(azar(600, 1300));
    }
    if (didLock !== null) await soltarAldea();

    // si el envío directo no anda en este servidor, vuelvo al método de hacer clic
    if (errores + sinconf >= 3 && ok === 0) {
      ss.set('tb_tropas_iconos', '1');
      log('tropas: el envío directo no se confirmó ' + (errores + sinconf) + ' veces — paso a entrar por los íconos');
      await guardarDiag('tropas: fetch sin confirmar');
    }
    const ms = await programarEn(cortado ? ahora() + 8000 : proximoTurno(c, dids, nextu, ahora()));
    estado({ txt: cortado ? 'esperando turno' : 'ronda terminada', next: ahora() + ms, ult: hhmm(ahora()) });
    log('tropas: ' + ok + ' entrenados' + (sinconf ? ', ' + sinconf + ' sin confirmar' : '') + (errores ? ', ' + errores + ' con error' : '') +
        (cortado ? ' — cedo el turno' : '') + ', vuelvo en ' + Math.round(ms / 1000) + ' s');
    /* entre rondas la pestaña espera en /profile: en un cuartel con cola,
       Travian recarga la página sola cada vez que termina una unidad y eso
       cortaba la ronda a mitad de un envío ("Failed to fetch") */
    if (!/^\/profile/.test(location.pathname)) irA(location.origin + '/profile');
  }

  /* ═══════════ 8 · CONSTRUCCIÓN (campos + edificios + herrería + NPC + oro) ═══════════ */

  function cfgAldea(did) {
    const base = { campos: { on: true, nivelMax: 10, tipos: [1, 2, 3, 4] }, edificios: [], herreria: [], npc: { on: false, umbral: 95 }, oro: { terminar: false } };
    const todas = CFG.recursos.aldeas;
    const a = (todas && typeof todas === 'object' && !Array.isArray(todas)) ? todas[did] : null;
    if (!a) return base;
    return {
      campos: Object.assign({}, base.campos, a.campos || {}),
      edificios: Array.isArray(a.edificios) ? a.edificios : [],
      herreria: Array.isArray(a.herreria) ? a.herreria : [],
      npc: Object.assign({}, base.npc, a.npc || {}),
      oro: Object.assign({}, base.oro, a.oro || {}),
    };
  }
  const aldeaConTrabajo = did => { const a = cfgAldea(did); return !!(a.campos.on || a.edificios.length || a.herreria.length || a.npc.on); };

  async function hacerNPC(did) {
    const st = leerStock();
    const b = botonExchange();
    if (!b) { await guardarDiag('npc: sin botón Exchange'); log('NPC: no encuentro "Exchange resources" en esta página'); return false; }
    await clic(b); await dormir(1800);
    const ins = [0, 1, 2, 3].map(i => $('input[name="desired' + i + '"]'));
    if (ins.some(i => !i)) { await guardarDiag('npc: diálogo sin inputs'); cerrarDialogo(); return false; }
    const sum = st.cur.reduce((a, b2) => a + b2, 0);
    let cereal = Math.floor(sum / 4);
    if (st.capG) cereal = Math.min(cereal, Math.floor(st.capG * 0.9));
    let otro = Math.floor((sum - cereal) / 3);
    if (st.capW) otro = Math.min(otro, Math.floor(st.capW * 0.95));
    const objetivo = [otro, otro, otro, sum - otro * 3];   // suma exacta: el juego lo exige
    ins.forEach((inp, i) => escribir(inp, objetivo[i]));
    await dormir(900);
    const ok = $('#npc_market_button');
    if (!ok || botonApagado(ok)) { log('NPC: el juego no acepta ' + objetivo.join('/') + ' — lo dejo'); cerrarDialogo(); return false; }
    await clic(ok); await dormir(1500);
    const conf = $('.dialogOverlay.dialogVisible button.dialogButtonOk');
    if (conf && !botonApagado(conf)) { await clic(conf); await dormir(1200); }
    log('NPC @' + did + ': ' + st.cur.join('/') + ' → ' + objetivo.join('/') + ' (cuesta 3 oro)');
    return true;
  }

  async function terminarConOro(did) {
    const b = botonOroTerminar();
    if (!b || botonApagado(b)) return false;
    await clic(b); await dormir(1500);
    const conf = $('.dialogOverlay.dialogVisible button.dialogButtonOk, .dialogOverlay.dialogVisible button.green');
    if (conf && !botonApagado(conf)) { await clic(conf); await dormir(1200); log('construcción terminada con oro @' + did); return true; }
    await guardarDiag('oro: sin diálogo de confirmación (sin verificar)');
    cerrarDialogo();
    return false;
  }

  // construir un edificio nuevo en un slot vacío (sin verificar: markup T4.6)
  async function construirNuevo(gid) {
    const cont = $('#contract_building' + gid) ||
                 $$('[id^="contract_building"]').find(x => num(x.id.replace('contract_building', '')) === gid);
    if (!cont) return 'sin-contrato';
    const b = Array.from(cont.querySelectorAll('button')).find(x => /green/.test(cls(x)) && !/gold|purple/.test(cls(x)));
    if (!b) return 'sin-boton';
    if (botonApagado(b)) return 'apagado';
    await clic(b); await dormir(1200);
    return 'ok';
  }

  async function pasoRecursos(info) {
    const c = CFG.recursos;
    const conocidas = (info.aldeas || []).map(a => String(a.did));
    let dids = conocidas.filter(aldeaConTrabajo);
    if (!dids.length && !conocidas.length) dids = [''];
    if (!dids.length) {
      log('construcción: ninguna aldea tiene nada tildado');
      const ms = await programarEn(ahora() + 120000);
      estado({ txt: 'sin plan', next: ahora() + ms });
      return;
    }

    let cola = ss.json('tb_colar', []);
    if (!cola.length) {
      if (c.unaPorVuelta !== false && dids.length > 1) {
        const i = (num(info.rot) || 0) % dids.length;
        cola = [{ did: dids[i], fase: 'dorf1', hechos: [] }];
        await bg({ tipo: 'rot', rot: (i + 1) % dids.length });
      } else cola = dids.map(did => ({ did, fase: 'dorf1', hechos: [] }));
      ss.set('tb_colar', JSON.stringify(cola));
    }

    const paso = cola[0];
    const A = cfgAldea(paso.did);
    const guardar = () => ss.set('tb_colar', JSON.stringify(cola));
    const siguiente = async () => {
      cola.shift(); guardar();
      await soltarAldea();
      if (cola.length) { await dormir(azar(600, 1400)); irA(urlDorf1(cola[0].did)); return; }
      const ms = await programarEn(T_INICIO + sortear(c.cada, [180, 300]));
      estado({ txt: 'ronda terminada', next: ahora() + ms, ult: hhmm(ahora()) });
      log('construcción: ronda terminada, vuelvo en ' + Math.round(ms / 1000) + ' s');
    };
    const volverADorf2 = () => { paso.fase = 'dorf2'; guardar(); irA(urlDorf2(paso.did)); };

    if (!(await tomarAldea(paso.did))) { await programarEn(ahora() + 10000); return; }

    /* — dorf1: stock, NPC si hace falta, y el campo más bajo — */
    if (paso.fase === 'dorf1') {
      if (!enDorf1() || !mismaAldea(paso.did)) {
        paso.intentos = (paso.intentos || 0) + 1;
        if (paso.intentos > 3) { log('no llego a la aldea ' + paso.did + ', la salteo'); await siguiente(); return; }
        guardar(); irA(urlDorf1(paso.did)); return;
      }
      paso.intentos = 0;
      const st = leerStock();
      const campos = leerCampos();
      if (A.npc.on && !paso.npcHecho && st.pct.some(p => p >= (num(A.npc.umbral) || 95)) && campos.length) {
        log('@' + paso.did + ' depósito al ' + Math.max.apply(null, st.pct) + '% → voy a hacer NPC');
        paso.fase = 'npc'; paso.id = campos[0].id; guardar();
        irA(urlSlot(paso.did, paso.id)); return;
      }
      if (A.campos.on) {
        if (!campos.length) await guardarDiag('campos: no leo dorf1');
        const tipos = (A.campos.tipos && A.campos.tipos.length) ? A.campos.tipos : [1, 2, 3, 4];
        const cand = campos.filter(x => tipos.indexOf(x.gid) >= 0 && x.nivel < (num(A.campos.nivelMax) || 10) && !/maxLevel|underConstruction/.test(x.estado));
        cand.sort((a, b) => a.nivel - b.nivel || a.gid - b.gid);
        const listo = cand.find(x => /good/.test(x.estado)) || null;
        if (listo) { paso.fase = 'campo'; paso.id = listo.id; paso.gid = listo.gid; paso.nivel = listo.nivel; guardar(); irA(urlSlot(paso.did, paso.id)); return; }
        if (cand.length) log('@' + paso.did + ' campos: ' + RECURSO[cand[0].gid] + ' nv' + cand[0].nivel + ' todavía no (recursos/cola)');
        else log('@' + paso.did + ' campos al tope');
      }
      volverADorf2(); return;
    }

    /* Los botones de ampliar/mejorar/NPC pueden recargar la página en el acto:
       el paso siguiente se guarda ANTES del clic, si no se repite para siempre. */
    if (paso.fase === 'npc') {
      paso.npcHecho = 1; paso.fase = 'dorf1'; guardar();
      await hacerNPC(paso.did);
      await dormir(800);
      irA(urlDorf1(paso.did));
      return;
    }

    if (paso.fase === 'campo') {
      const btn = botonMejorar();
      paso.fase = 'dorf2'; guardar();
      if (!btn) { await guardarDiag('campo: sin botón de ampliar'); log('no encuentro el botón de ampliar el campo'); }
      else if (botonApagado(btn)) log(RECURSO[paso.gid] + ' nv' + paso.nivel + ' @' + paso.did + ': todavía no');
      else { log('⬆ ' + RECURSO[paso.gid] + ' ' + paso.nivel + '→' + (paso.nivel + 1) + ' @' + paso.did); await clic(btn); await dormir(azar(800, 1500)); }
      irA(urlDorf2(paso.did)); return;
    }

    /* — dorf2: edificios elegidos, nuevos, herrería, oro — */
    if (paso.fase === 'dorf2') {
      if (!enDorf2() || !mismaAldea(paso.did)) {
        paso.intentos = (paso.intentos || 0) + 1;
        if (paso.intentos > 3) { log('no llego al centro de ' + paso.did + ', la salteo'); await siguiente(); return; }
        guardar(); irA(urlDorf2(paso.did)); return;
      }
      paso.intentos = 0;
      const slots = leerSlotsDorf2();
      if (slots.length) await bg({ tipo: 'edificiosDe', did: paso.did, slots });
      const hechos = paso.hechos || [];

      for (const e of A.edificios) {
        const gid = num(e.gid); if (!gid || hechos.indexOf(gid) >= 0) continue;
        const s = slots.find(x => x.gid === gid);
        if (s) {
          if (s.nivel >= (num(e.nivelMax) || 1)) continue;
          if (!/good/.test(s.estado)) { log((s.nombre || 'gid' + gid) + ' nv' + s.nivel + ' @' + paso.did + ': todavía no'); continue; }
          paso.fase = 'edificio'; paso.aid = s.aid; paso.gid = gid; paso.nivel = s.nivel; paso.nombre = s.nombre; guardar();
          irA(urlEdificio(paso.did, s.aid, gid)); return;
        }
        const vacio = slots.find(x => x.gid === 0 && x.aid >= 19 && x.aid <= 38);
        if (!vacio) { log('gid' + gid + ' @' + paso.did + ': no existe y no hay slot libre'); hechos.push(gid); continue; }
        paso.fase = 'nuevo'; paso.aid = vacio.aid; paso.gid = gid; guardar();
        irA(urlSlot(paso.did, vacio.aid)); return;
      }

      if (A.herreria.length && !paso.herrHecha) {
        const s13 = slots.find(x => x.gid === 13);
        if (s13) { paso.fase = 'herreria'; paso.aid = s13.aid; guardar(); irA(urlEdificio(paso.did, s13.aid, 13)); return; }
        log('@' + paso.did + ': no tiene herrería');
        paso.herrHecha = 1;
      }

      if (A.oro.terminar && !paso.oroHecho) {
        paso.oroHecho = 1; guardar();
        if ($$('.buildingList li').length) await terminarConOro(paso.did);
      }
      await siguiente(); return;
    }

    if (paso.fase === 'edificio') {
      const btn = botonMejorar();
      paso.hechos = (paso.hechos || []).concat([paso.gid]);
      paso.fase = 'dorf2'; guardar();
      if (!btn) { await guardarDiag('edificio: sin botón de ampliar'); log('no encuentro el botón de ampliar ' + (paso.nombre || 'gid' + paso.gid)); }
      else if (botonApagado(btn)) log((paso.nombre || 'gid' + paso.gid) + ' @' + paso.did + ': todavía no');
      else { log('⬆ ' + (paso.nombre || 'gid' + paso.gid) + ' ' + paso.nivel + '→' + (paso.nivel + 1) + ' @' + paso.did); await clic(btn); await dormir(azar(800, 1500)); }
      irA(urlDorf2(paso.did)); return;
    }

    if (paso.fase === 'nuevo') {
      paso.hechos = (paso.hechos || []).concat([paso.gid]);
      const gidNuevo = paso.gid;
      paso.fase = 'dorf2'; guardar();
      const r = await construirNuevo(gidNuevo);
      if (r === 'ok') log('🏗 construyo gid' + gidNuevo + ' @' + paso.did);
      else { log('construir gid' + gidNuevo + ' @' + paso.did + ': ' + r); if (r !== 'apagado') await guardarDiag('nuevo: ' + r); }
      irA(urlDorf2(paso.did)); return;
    }

    if (paso.fase === 'herreria') {
      const filas = filasDeHerreria();
      if (!filas.length) await guardarDiag('herrería: sin filas');
      if (filas.length) await bg({ tipo: 'herreriaDe', did: paso.did, filas: filas.map(x => ({ u: x.u, nombre: x.nombre, nivel: x.nivel })) });
      paso.herrHecha = 1;
      paso.fase = 'dorf2'; guardar();
      for (const h of A.herreria) {
        const f = filas.find(x => x.u === num(h.u));
        if (!f || f.nivel >= (num(h.nivelMax) || 1)) continue;
        if (!f.activo) { log('herrería @' + paso.did + ': ' + f.nombre + ' nv' + f.nivel + ' todavía no'); continue; }
        log('⚒ herrería @' + paso.did + ': ' + f.nombre + ' ' + f.nivel + '→' + (f.nivel + 1));
        await clic(f.btn); await dormir(azar(900, 1500));
        break;       // una mejora por vuelta: la cola de investigación es corta
      }
      irA(urlDorf2(paso.did)); return;
    }

    // fase desconocida: reinicio la aldea
    paso.fase = 'dorf1'; guardar(); irA(urlDorf1(paso.did));
  }

  /* ═══════════ 9 · HÉROE ═══════════
     La salud NO está en /hero/adventures: vive en /hero/attributes como texto
     ("Health … 72%"). La barra SVG del encabezado da un número equivocado
     (50% cuando eran 72%), así que no se usa. */

  const enAtributos = () => /\/hero\/attributes/.test(location.pathname);
  const enAventuras = () => /\/hero\/adventures/.test(location.pathname) || !!$('table.adventureList');

  function leerSaludAtributos() {
    const cont = $('#attributes, .attributes, [class*="attribute"]') || document.body;
    const t = txt(cont);
    // el HTML del servidor ya trae "Health: 100%" antes de que React dibuje.
    // Sin comodín "cualquier N%": podía agarrar "Loyalty: 100%".
    const m = t.match(/(?:health|salud|leben|vida)[\s\S]{0,400}?(\d{1,3})\s*%/i);
    return m ? parseInt(m[1], 10) : null;
  }
  function saludGuardada() {
    const v = ss.get('tb_salud');
    if (!v) return null;
    const p = v.split('|');
    if (ahora() - parseInt(p[1], 10) > 90000) return null;
    return parseInt(p[0], 10);
  }
  // fila: td.place / td.distance / td.duration / td.difficulty / td.button > button "Explore" (verificado)
  const filasAventura = () => $$('table.adventureList tbody tr, table.adventureList tr').filter(tr => tr.querySelector('td.button button, button'));
  const botonExplorar = tr => tr.querySelector('td.button button') || tr.querySelector('button');
  function minutosDuracion(tr) {
    const e = tr.querySelector('td.duration, .duration, td.moveTime');
    if (!e) return 9999;
    const m = txt(e).match(/(\d+):(\d+):(\d+)/);
    if (m) return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
    return num(txt(e)) || 9999;
  }

  async function pasoHeroe() {
    const c = CFG.heroe;

    if (ss.get('tb_hero_conf') === '1') {
      ss.del('tb_hero_conf');
      const btn = q(['button.startAdventure', '.dialogOverlay.dialogVisible button.dialogButtonOk', '#start']);
      if (btn && !botonApagado(btn)) { await clic(btn); await dormir(1200); }
      const ms = await programar(c.cadaSeg);
      estado({ txt: 'aventura enviada', next: ahora() + ms, ult: hhmm(ahora()) });
      log('aventura enviada ✔');
      return;
    }

    let salud = saludGuardada();
    if (salud == null) {
      if (!enAtributos()) { estado({ txt: 'viendo la salud' }); irA(location.origin + '/hero/attributes'); return; }
      /* héroe muerto: /hero/attributes muestra .heroDead ("Your hero is dead" +
         revivir). La barra de salud vieja sigue en la página y se leía como
         92 %. Revivirlo cuesta recursos: lo decide el jugador, el bot no. */
      if ($('.heroDead, .statusDead_medium')) {
        if (ahora() - parseInt(ss.get('tb_muerto_log') || '0', 10) > 3600000) { log('⚠ el héroe está muerto: hay que revivirlo en el juego (el bot no gasta recursos en eso)'); ss.set('tb_muerto_log', String(ahora())); }
        const ms = await programarEn(ahora() + 600000);
        estado({ txt: 'héroe muerto (revivir en el juego)', next: ahora() + ms });
        return;
      }
      // el bloque de atributos se dibuja DESPUÉS de cargar la página: reintento
      for (let i = 0; i < 10; i++) { salud = leerSaludAtributos(); if (salud != null) break; await dormir(1200); }
      if (salud == null) {
        await guardarDiag('héroe: no leo la salud');
        log('no puedo leer la salud del héroe');
        if (c.exigirSalud) { const ms = await programar(c.cadaSeg); estado({ txt: 'no leo la salud', next: ahora() + ms }); return; }
      } else {
        ss.set('tb_salud', salud + '|' + ahora());
        log('salud del héroe: ' + salud + '%');
      }
      irA(location.origin + '/hero/adventures');
      return;
    }

    if (salud < c.saludMin) {
      ss.del('tb_salud');
      const ms = await programar(c.cadaSeg);
      estado({ txt: 'salud ' + salud + '% < ' + c.saludMin + '%', next: ahora() + ms });
      log('héroe al ' + salud + '%, no lo mando');
      return;
    }

    if (!enAventuras()) { irA(location.origin + '/hero/adventures'); return; }

    /* la tabla la dibuja React DESPUÉS de cargar (el HTML trae sólo
       <div id="heroAdventure">): espero hasta 15 s a que aparezca */
    let filas = filasAventura();
    for (let i = 0; i < 15 && !filas.length; i++) {
      if ($('table.adventureList') && i >= 3) break;   // tabla dibujada y sin filas = no hay
      await dormir(1000);
      filas = filasAventura();
    }
    if (!filas.length) {
      await guardarDiag('héroe: sin aventuras');
      const ms = await programar(c.cadaSeg);
      estado({ txt: 'sin aventuras', next: ahora() + ms });
      log('no hay aventuras disponibles');
      return;
    }
    const orden = filas.slice();
    if (c.elegir === 'corta') orden.sort((a, b) => minutosDuracion(a) - minutosDuracion(b));
    if (c.elegir === 'larga') orden.sort((a, b) => minutosDuracion(b) - minutosDuracion(a));

    // la primera (según el orden elegido) que tenga el botón habilitado: antes
    // miraba sólo la primera y, si esa estaba apagada, decía "ocupado" para siempre
    const elegida = orden.find(tr => { const b = botonExplorar(tr); return b && !botonApagado(b); });
    const btn = elegida ? botonExplorar(elegida) : null;
    if (!btn) {
      const ms = await programar(c.cadaSeg);
      estado({ txt: 'héroe ocupado (' + filas.length + ' aventuras, ninguna disponible)', next: ahora() + ms });
      return;
    }
    log('mando al héroe (' + minutosDuracion(elegida) + ' min, salud ' + salud + '%)');
    ss.set('tb_hero_conf', '1');
    ss.del('tb_salud');
    await clic(btn);
    // si el click no navega (manda por ajax), cierro la vuelta acá mismo.
    // Se espera DENTRO del tick (no en un setTimeout suelto) para que el
    // bucle no arranque otra vuelta del héroe mientras tanto.
    await dormir(2500);
    if (ss.get('tb_hero_conf') !== '1') return;
    ss.del('tb_hero_conf');
    const conf = q(['.dialogOverlay.dialogVisible button.dialogButtonOk', 'button.startAdventure']);
    if (conf && !botonApagado(conf)) { await clic(conf); await dormir(1200); }
    const ms = await programar(c.cadaSeg);
    estado({ txt: 'aventura enviada', next: ahora() + ms, ult: hhmm(ahora()) });
    log('aventura enviada ✔');
  }

  /* ═══════════ 10 · FARM LIST ═══════════ */

  async function pasoFarm() {
    const c = CFG.farm;
    const did = c.did ? String(c.did) : '';
    const url = location.origin + '/build.php?' + (did ? 'newdid=' + did + '&' : '') + 'gid=16&tt=99';

    if (did && !(await tomarAldea(did))) { await programarEn(ahora() + 10000); return; }
    if (gidActual() !== 16 || (did && !mismaAldea(did))) {
      const n = parseInt(ss.get('tb_int_farm') || '0', 10);
      if (n >= 3) { ss.del('tb_int_farm'); await guardarDiag('farm: no llego a la farm list'); const ms = await programar(c.cadaSeg); estado({ txt: 'sin farm list', next: ahora() + ms }); return; }
      ss.set('tb_int_farm', String(n + 1));
      irA(url); return;
    }
    ss.del('tb_int_farm');
    /* SIEMPRE con la página recién cargada: después de un "Start all" la
       página vieja deja todos los botones apagados aunque en el juego estén
       disponibles (26/09: el bot veía "0 enviadas, 12 sin objetivos"). */
    if (paginaVieja(45000)) { location.reload(); return; }

    let listas = await listasFarm();
    if (!listas.length) {
      await guardarDiag('farm: sin listas');
      const ms = await programar(c.cadaSeg);
      estado({ txt: 'sin farm lists', next: ahora() + ms });
      log('no veo farm lists en esta página');
      return;
    }
    const filtrar = c.listas !== 'todas' && Array.isArray(c.listas) && c.listas.length;
    if (filtrar) {
      const filtro = c.listas.map(s => String(s).toLowerCase());
      listas = listas.filter(l => filtro.some(f => l.nombre.toLowerCase().indexOf(f) >= 0));
    }
    const conObjetivos = listas.filter(l => !botonApagado(l.btn));
    const vacias = listas.length - conObjetivos.length;
    farmApagadosBase = $$('button.startFarmList').filter(botonApagado).length;   // antes de cualquier clic

    /* 1) "Start all farm lists": un clic manda todas */
    const todas = filtrar ? null : $('button.startAllFarmLists');
    let enviadas = 0;
    if (todas && !botonApagado(todas)) {
      await clic(todas);
      enviadas = conObjetivos.length;
      /* "Start all" manda las listas DE A UNA (POST /api/v1/farm-list/send,
         cada una espera la respuesta de la anterior; medido ~2,5 s por lista
         con la PC cargada). No recargo hasta que salieron todas. */
      await esperarFarm(90000);
      log('farm: Start all farm lists ✔ — ' + conObjetivos.map(l => l.nombre + ' (' + txt(l.btn).replace(/\D/g, '') + ')').join(', '));
    } else {
      /* 2) de a una. Al apretar una, el juego apaga un momento los botones de
         TODAS: antes el bot las recorría en medio segundo y las contaba como
         "vacías". Ahora espera que vuelvan antes de mirar la siguiente. */
      const recien = ss.json('tb_farm_recien', {});
      for (const l of listas) {
        await esperarFarm(15000);
        const b = botonDeLista(l.nombre) || l.btn;
        if (botonApagado(b)) continue;
        if (recien[l.nombre] && ahora() - recien[l.nombre] < 40000) continue;
        await clic(b);
        recien[l.nombre] = ahora(); ss.set('tb_farm_recien', JSON.stringify(recien));
        enviadas++;
        log('farm "' + l.nombre + '" → ' + txt(b));
        await dormir(azar(400, 800));
      }
    }
    if (did) await soltarAldea();
    // recarga antes de la próxima vuelta; si no salió nada, reintento a los 20 s (la farm list es prioridad 1)
    const ms = enviadas ? await programar(c.cadaSeg) : await programarEn(ahora() + 20000);
    estado({ txt: enviadas + ' lista(s) enviadas', next: ahora() + ms, ult: hhmm(ahora()) });
    log('farm: ' + enviadas + ' lista(s) enviadas' + (vacias ? ', ' + vacias + ' sin objetivos' : '') + ', vuelvo en ' + Math.round(ms / 1000) + ' s');
  }
  const botonDeLista = nombre => {
    const w = $$('.farmListWrapper').find(x => txt(x.querySelector('.farmListName, .listTitleText, .listName')) === nombre);
    return w ? q(['button.startFarmList', '.startFarmList'], w) : null;
  };
  /* espera a que los botones "Start" se vuelvan a habilitar después de un
     envío (vuelven al número de apagados que había al empezar, o se cumple el
     tiempo) */
  let farmApagadosBase = 0;
  async function esperarFarm(ms) {
    const apagados = () => $$('button.startFarmList').filter(botonApagado).length;
    const t0 = ahora();
    await dormir(800);
    while (ahora() - t0 < ms && apagados() > farmApagadosBase) await dormir(700);
  }

  /* ═══════════ 11 · bucle ═══════════ */

  /* `ocupado` se marca ANTES del primer await. Antes se marcaba después de
     preguntarle al service worker: con Chrome frenando los timers de las
     pestañas en segundo plano, el setInterval y el despertador disparaban
     juntos, los dos pasaban el control y la ronda corría dos veces a la vez
     (farm list enviada 9 veces en el mismo segundo, tropas "no llego al
     edificio" porque una vuelta recargaba la página de la otra). */
  async function tick() {
    if (ocupado) return;
    if (NAVEGANDO && ahora() - NAVEGANDO < 60000) return;   // ya pedí otra página (60 s: con la PC cargada una carga tarda 20-40 s y reintentar antes la reiniciaba)
    NAVEGANDO = 0;
    ocupado = true;
    try { await tickInterno(); }
    catch (e) { try { log('error: ' + (e && e.message ? e.message : e)); } catch (e2) {} }
    finally { ocupado = false; }
  }

  /* métrica de carga: cuánto tardó la página en darme el control (desde que
     empezó la navegación) y cuánto tarda el service worker en contestar.
     Se manda una vez por página a tb_metrica. */
  let metricaEnviada = false;
  const INYECTADO = Math.round(performance.now());

  let ultConsulta = 0;
  async function tickInterno() {
    /* esperando mi turno y falta más de 4 s: no molesto al service worker en
       cada vuelta, sólo cada 20 s (parar/forzar recargan o cierran la pestaña) */
    if (ROL && RUN && NEXT - ahora() > 4000 && ahora() - ultConsulta < 20000) { pintarBanner(); return; }
    ultConsulta = ahora();
    const t0 = performance.now();
    const enviado = Date.now();
    const info = await bg({ tipo: 'quienSoy' });
    if (!metricaEnviada && info.rol) {
      metricaEnviada = true;
      const llego = Date.now(), h = info.horas || {};
      (async () => {
        const d0 = Date.now(); await dormir(1000); const dormirReal = Date.now() - d0;
        bg({ tipo: 'metrica', m: { rol: info.rol, url: location.pathname, iny: INYECTADO,
             tick: Math.round(t0), rtt: Math.round(performance.now() - t0),
             ida: h.recibido ? h.recibido - enviado : -1, fila: info.fila || 0,
             dur: h.fin ? h.fin - h.inicio : -1, vuelta: h.fin ? llego - h.fin : -1,
             dormir1000: dormirReal, oculta: document.hidden } });
      })();
    }
    ROL = info.rol;
    if (!ROL) { if (bannerEl) { bannerEl.remove(); bannerEl = null; } return; }
    /* Saco el newdid de la dirección de las pestañas del bot: si después se
       recarga (meta refresh, vigilante), pedir de nuevo ?newdid=X le cambia la
       aldea activa a TODA la sesión, en medio de lo que esté haciendo otra
       pestaña (26/09: Tropas "no llegaba" a 05T y 06 por eso). */
    if (/[?&]newdid=/.test(location.search)) {
      try {
        const u = new URL(location.href);
        u.searchParams.delete('newdid');
        history.replaceState(history.state, '', u.pathname + (u.searchParams.toString() ? '?' + u.searchParams.toString() : '') + u.hash);
      } catch (e) {}
    }
    CFG = info.cfg; INFO = info;

    if (!bannerEl) crearBanner();

    if (chequeoAntibot()) { cancelarRecarga(); await bg({ tipo: 'alarma', m: 'Captcha / control antibot en ' + NOMBRE[ROL] }); marcar('⛔ captcha', false, 0); return; }
    // la pestaña terminó fuera del servidor del juego (sesión vencida → lobby de travian.com): paro y aviso
    if (info.origen && location.origin !== info.origen && info.run) {
      cancelarRecarga();
      await bg({ tipo: 'alarma', m: 'Sesión cerrada: la pestaña de ' + NOMBRE[ROL] + ' terminó en ' + location.host });
      marcar('⛔ sin sesión', false, 0); return;
    }
    if (chequeoLogin())   { cancelarRecarga(); await bg({ tipo: 'alarma', m: 'Sesión cerrada en ' + NOMBRE[ROL] }); marcar('⛔ sin sesión', false, 0); return; }

    const escaneando = ROL === 'tropas' && info.scan && info.scan.activo;

    /* la farm list es prioridad 1: si está saliendo o por salir, las demás
       pestañas esperan y no le compiten la CPU */
    if (!escaneando && ROL !== 'farm' && info.farmPrimero && info.run && ahora() >= info.next) {
      if (ultEstado.txt !== 'cedo el paso a la farm list') estado({ txt: 'cedo el paso a la farm list' });
      marcar('cedo el paso a la farm list', true, 0);
      return;
    }

    /* farm list en modo 'api': la manda el service worker. Esta pestaña sólo
       muestra la farm list y se refresca cada 3 min; NO programa nada (el
       próximo envío lo maneja el service worker). */
    if (ROL === 'farm' && info.run && info.activo && (CFG.farm.modo || 'api') === 'api') {
      if (gidActual() !== 16 && !NAVEGANDO) { irA(location.origin + '/build.php?gid=16&tt=99'); return; }
      if (!document.querySelector('meta[http-equiv="refresh"][data-tb]')) recargarEn(180);
      RUN = true; NEXT = info.next || 0; ultEstado = { txt: 'la manda el service worker' }; pintarBanner();
      return;
    }

    if (!escaneando) {
      if (!info.run)    { cancelarRecarga(); estado({ txt: 'detenido' }); marcar('detenido', false, 0); return; }
      // apagado en el panel, o pausado por el MODO elegido (el service worker decide: info.activo)
      if (!info.activo) {
        const t = CFG[ROL].on ? 'pausado (modo ' + String(CFG.modo || 'todo').toUpperCase() + ')' : 'apagado';
        cancelarRecarga(); if (ultEstado.txt !== t) estado({ txt: t }); marcar(t, false, 0); return;
      }
      if (ahora() < info.next) {
        RUN = true; NEXT = info.next; pintarBanner();
        const falta = info.next - ahora();
        if (falta < 5000) { clearTimeout(despertador); despertador = setTimeout(tick, falta + 40); }
        return;
      }
    }

    T_INICIO = ahora();
    bg({ tipo: 'trabajando', rol: ROL });   // sin esperar: cada ida y vuelta cuesta segundos con la PC cargada
    try {
      if (escaneando)              await pasoEscaneo(info);
      else if (ROL === 'tropas')   await pasoTropas(info);
      else if (ROL === 'heroe')    await pasoHeroe();
      else if (ROL === 'farm')     await pasoFarm();
      else if (ROL === 'recursos') await pasoRecursos(info);
    } catch (e) {
      log('error: ' + (e && e.message ? e.message : e));
      if (CFG[ROL] && CFG[ROL].cada) await programarEn(ahora() + rango(CFG[ROL].cada, [60, 90])[0] * 1000);
      else await programar(CFG[ROL] ? CFG[ROL].cadaSeg : 69);
    }
  }

  /* ═══════════ 12 · banner ═══════════ */

  function crearBanner() {
    if (!document.body) return;
    const st = document.createElement('style');
    st.textContent = '.tb-banner{position:fixed;left:10px;bottom:10px;z-index:2147483000;background:#1f1f22;' +
      'color:#e6e6e6;border:1px solid #3a3a40;border-left:4px solid #4caf50;border-radius:8px;padding:7px 10px;' +
      'display:flex;align-items:center;gap:9px;font:12px system-ui,Segoe UI,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.5)}' +
      '.tb-banner.tb-off{border-left-color:#8a3b3b;opacity:.75}' +
      '.tb-banner button{background:#3a3a42;border:0;color:#ddd;border-radius:5px;padding:3px 7px;cursor:pointer;font-size:10px}' +
      '.tb-b-estado{color:#9bd}';
    document.head.appendChild(st);
    bannerEl = document.createElement('div');
    bannerEl.className = 'tb-banner';
    bannerEl.innerHTML = '<b>' + NOMBRE[ROL] + '</b><span class="tb-b-estado">…</span>' +
                         '<button class="tb-ya">ahora</button><button class="tb-stop">parar</button>';
    document.body.appendChild(bannerEl);
    bannerEl.querySelector('.tb-ya').onclick   = () => bg({ tipo: 'forzar', rol: ROL });
    bannerEl.querySelector('.tb-stop').onclick = () => bg({ tipo: 'parar' });
    setInterval(pintarBanner, 250);
  }
  /* el reloj se dibuja aparte del bucle (4 Hz, contra Date.now()): dentro del
     tick de 2 s bajaría de a 2 segundos */
  function pintarBanner() {
    if (!bannerEl) return;
    // en el userscript la misma pestaña va cambiando de tarea: el título la muestra
    const tit = bannerEl.querySelector('b');
    if (tit && ROL && tit.textContent !== NOMBRE[ROL]) tit.textContent = NOMBRE[ROL];
    const falta = NEXT > ahora() ? Math.ceil((NEXT - ahora()) / 1000) : 0;
    const nuevo = (RUN ? '● ' : '○ ') + (ultEstado.txt || '—') + (falta ? '  ·  ' + falta + 's' : '');
    const el = bannerEl.querySelector('.tb-b-estado');
    if (el.textContent !== nuevo) el.textContent = nuevo;
    bannerEl.classList.toggle('tb-off', !RUN);
  }
  function marcar(texto, run, next) { ultEstado = { txt: texto }; RUN = !!run; NEXT = next || 0; pintarBanner(); }

  /* ═══════════ 13 · arranque ═══════════ */
  /* bucle con dormir() (reloj del service worker), no con setInterval: el
     setInterval de una pestaña oculta también cae a una vez por minuto */
  function arrancarBucle() {
    const go = async () => { for (;;) { await tick(); await dormir(2000); } };
    if (document.body) go(); else document.addEventListener('DOMContentLoaded', go);
  }
  if (/travian/i.test(location.hostname)) arrancarBucle();
  else {
    try {
      chrome.storage.local.get('tb_dominio').then(o => {
        const d = (o && o.tb_dominio) || '';
        if (d && location.hostname.indexOf(d) >= 0) arrancarBucle();
      }).catch(() => {});
    } catch (e) {}
  }
})();
