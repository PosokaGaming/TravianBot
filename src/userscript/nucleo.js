/*  TravianBot · núcleo del userscript
 *
 *  Hace dentro de la página lo que en la extensión hace el service worker:
 *  guarda el estado (almacenamiento de Tampermonkey, compartido entre
 *  pestañas), decide qué trabajo toca, manda la farm list por la API del
 *  juego y atiende los mensajes bg({ tipo }) del bot y del panel.
 *
 *  Diferencias con la extensión:
 *  - UNA sola pestaña trabaja (la "líder"): hace tropas, héroe y construcción
 *    por turnos. Si abrís Travian en otra pestaña, esa no hace nada.
 *  - No hay candado de aldea (hay una sola pestaña trabajando).
 *  - La farm list siempre sale por la API (sin cargar la página).
 */
const TB = (function () {
  'use strict';

  const ROLES  = ['tropas', 'heroe', 'farm', 'recursos', 'lista'];
  const NOMBRE = { tropas: 'Tropas', heroe: 'Héroe', farm: 'Farm list', recursos: 'Construcción', lista: 'TO DO' };

  const CFG_DEF = {
    // plan = { '<did>': { '<gid>': { cada:[min,max] seg, u:[{t,min,max,usarMax}] } } }
    tropas  : { on: true, plan: {}, aldeas: 'todas', cada: [60, 90], cant: [5, 10], modo: 'iconos' },
    heroe   : { on: true, saludMin: 30, exigirSalud: true, elegir: 'corta', cadaSeg: 100 },
    farm    : { on: true, listas: 'todas', cadaSeg: 69, did: '', modo: 'api' },
    recursos: { on: true, cada: [180, 300], unaPorVuelta: true, aldeas: {} },
    lista   : { on: true, texto: '', cada: [60, 90], caballosHoras: 2, heroe: true, npc: false, npcMaxDia: 30 },   // TO DO LIST (lista.js); npc gasta oro: apagado de fábrica
    modo: 'todo',   // 'lista' | 'tropas' | 'farm' | 'construccion' | 'todo'
    cerrarAlParar: false,
    pausaPagina: 10,   // s mínimos en cada página antes de pasar a otra
    debug: false,
  };

  /* ───────────── almacenamiento (Tampermonkey, compartido entre pestañas) ───────────── */
  const get = (k, d) => { try { const v = GM_getValue(k); return v === undefined ? d : v; } catch (e) { return d; } };
  const set = (k, v) => { try { GM_setValue(k, v); } catch (e) {} };
  const esObjeto = v => !!v && typeof v === 'object' && !Array.isArray(v);
  const ss = {
    get: k => { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) {} },
    del: k => { try { sessionStorage.removeItem(k); } catch (e) {} },
  };

  function leerCfg() {
    const c = get('tb_cfg', null);
    const out = JSON.parse(JSON.stringify(CFG_DEF));
    if (esObjeto(c)) {
      for (const k of Object.keys(out)) {
        if (c[k] === undefined) continue;
        if (esObjeto(out[k])) Object.assign(out[k], c[k]);
        else out[k] = c[k];
      }
    }
    if (!esObjeto(out.tropas.plan)) out.tropas.plan = {};
    if (!esObjeto(out.recursos.aldeas)) out.recursos.aldeas = {};
    out.farm.modo = 'api';   // en el userscript la farm list siempre sale por la API
    return out;
  }

  function log(msg, rol) {
    const l = get('tb_log', []);
    l.push({ t: Date.now(), r: rol || 'bot', m: String(msg) });
    while (l.length > 150) l.shift();
    set('tb_log', l);
  }

  /* ───────────── modos ─────────────
     MODO TROPAS / FARM / CONSTRUCCIÓN: el bot se dedica al modo elegido; la
     farm list y el héroe siguen de fondo si están tildados. TODO = todo. */
  const MODO_ROL = { tropas: 'tropas', farm: 'farm', construccion: 'recursos', lista: 'lista' };
  function rolActivo(cfg, r) {
    if (!cfg[r] || !cfg[r].on) return false;
    const modo = cfg.modo || 'todo';
    if (r === 'heroe' || r === 'farm') return true;
    // MODO TO DO LIST: sólo la lista; nunca junto con los otros
    if (r === 'lista' || modo === 'lista') return MODO_ROL[modo] === r;
    if (modo === 'todo') return true;
    return MODO_ROL[modo] === r;
  }

  /* ───────────── pestaña líder ─────────────
     Sólo una pestaña trabaja. Late cada vez que pregunta (cada 2-20 s); si la
     líder no late hace más de 60 s, la toma cualquier otra. Darle ▶ en el
     panel de una pestaña la hace líder. */
  let MI_ID = ss.get('tb_tab_id');
  if (!MI_ID) { MI_ID = Math.random().toString(36).slice(2, 10); ss.set('tb_tab_id', MI_ID); }
  function soyLider(tomar) {
    const l = get('tb_lider', null), t = Date.now();
    if (tomar || !l || l.id === MI_ID || t - l.t > 60000) { set('tb_lider', { id: MI_ID, t }); return true; }
    return false;
  }

  /* ¿qué le toca a la pestaña líder? Si hay un trabajo de varias páginas a
     medias (tropas recorriendo aldeas, construcción, héroe), sigue con ese;
     si no, el que venza primero. La farm list no ocupa la pestaña: sale por
     la API desde acá mismo. */
  function elegirRol(cfg) {
    const scan = get('tb_scan', { activo: false });
    if (scan && scan.activo) return 'tropas';
    const actual = ss.get('tb_rol_actual');
    if (actual && rolActivo(cfg, actual) && actual !== 'farm') return actual;
    let mejor = null, min = Infinity;
    for (const r of ['lista', 'tropas', 'recursos', 'heroe']) {
      if (!rolActivo(cfg, r)) continue;
      const n = get('tb_next_' + r, 0) || 0;
      if (n < min) { min = n; mejor = r; }
    }
    return mejor;
  }

  /* ───────────── farm list por la API ─────────────
     Lo mismo que el botón "Start all farm lists" sin cargar la página:
     1. GET /build.php?gid=16&tt=99 → en `viewData` vienen las listas con sus
        objetivos (farmLists[].slotsStates[{id,isActive}]).
     2. Por cada lista con objetivos activos, en serie como el botón:
        POST /api/v1/farm-list/send {"action":"farmList","lists":[{"id","targets"}],
        "startedAll":true} (las siguientes llevan "triggeredBySendAll":true). */
  let farmCorriendo = false;
  function objetoJSON(h, desde) {
    const i = h.indexOf('{', desde);
    if (i < 0) return null;
    let prof = 0, enStr = false, esc = false;
    for (let j = i; j < h.length; j++) {
      const ch = h[j];
      if (enStr) { if (esc) esc = false; else if (ch === '\\') esc = true; else if (ch === '"') enStr = false; continue; }
      if (ch === '"') enStr = true;
      else if (ch === '{') prof++;
      else if (ch === '}' && --prof === 0) { try { return JSON.parse(h.slice(i, j + 1)); } catch (e) { return null; } }
    }
    return null;
  }
  async function farmPorApi() {
    if (farmCorriendo) return;
    farmCorriendo = true;
    const t0 = Date.now();
    let cada = 69, reintento = false;
    try {
      const cfg = leerCfg();
      if (!get('tb_run', false) || !rolActivo(cfg, 'farm')) return;
      cada = Math.max(30, Number(cfg.farm.cadaSeg) || 69);
      const origen = location.origin;
      set('tb_estado_farm', { t: t0, txt: 'enviando…' });
      const r = await fetch(origen + '/build.php?gid=16&tt=99', { credentials: 'include' });
      const h = await r.text();
      if (/id="botprotection"|class="botProtection"|name="botprotection"|id="bot_check"/i.test(h)) {
        set('tb_alarma', { t: Date.now(), m: 'Captcha / control antibot (farm list)' });
        parar('Captcha / control antibot (farm list)');
        return;
      }
      if (h.indexOf('villageInput') < 0) { log('farm: la página no trae la sesión (HTTP ' + r.status + '), reintento', 'farm'); reintento = true; return; }
      const k = h.indexOf('viewData:');
      const vd = k >= 0 ? objetoJSON(h, k) : null;
      const listas = vd && vd.ownPlayer && vd.ownPlayer.farmLists;
      if (!Array.isArray(listas)) { log('farm: no encuentro las listas en la página, reintento', 'farm'); reintento = true; return; }
      if (vd.ownPlayer.accessRights && vd.ownPlayer.accessRights.sendRaids === false) { log('farm: la cuenta no tiene permiso de mandar atracos', 'farm'); return; }
      let elegidas = listas.map(l => ({ id: l.id, nombre: l.name, targets: (l.slotsStates || []).filter(s => s.isActive).map(s => s.id) }))
                           .filter(l => l.targets.length);
      const f = cfg.farm.listas;
      if (f !== 'todas' && Array.isArray(f) && f.length) {
        const filtro = f.map(s => String(s).toLowerCase());
        elegidas = elegidas.filter(l => filtro.some(x => String(l.nombre).toLowerCase().indexOf(x) >= 0));
      }
      const ok = [], mal = [];
      for (let i = 0; i < elegidas.length; i++) {
        const l = elegidas[i];
        const body = { action: 'farmList', lists: [{ id: l.id, targets: l.targets }] };
        if (i === 0) body.startedAll = true; else body.triggeredBySendAll = true;
        try {
          const rr = await fetch(origen + '/api/v1/farm-list/send', {
            method: 'POST', credentials: 'include',
            headers: { 'Content-Type': 'application/json; charset=UTF-8' },
            body: JSON.stringify(body),
          });
          const txt = await rr.text();
          if (rr.ok) ok.push(l.nombre + ' (' + l.targets.length + ')');
          else mal.push(l.nombre + ': HTTP ' + rr.status + ' ' + txt.slice(0, 80));
        } catch (e) { mal.push(l.nombre + ': ' + (e && e.message ? e.message : e)); }
        await new Promise(ok2 => setTimeout(ok2, 300 + Math.random() * 500));
      }
      const sinObj = listas.length - elegidas.length;
      log('farm: ' + ok.length + '/' + elegidas.length + ' lista(s) enviadas ✔ ' + ok.join(', ') +
          (mal.length ? ' — FALLARON: ' + mal.join(' | ') : '') + (sinObj ? ' (' + sinObj + ' sin objetivos)' : ''), 'farm');
      set('tb_estado_farm', { t: Date.now(), txt: ok.length + ' lista(s) enviadas', ult: new Date().toLocaleTimeString('es-AR', { hour12: false }) });
      if (!ok.length && mal.length) reintento = true;
    } catch (e) {
      log('farm: ' + (e && e.message ? e.message : e) + ', reintento', 'farm');
      reintento = true;
    } finally {
      farmCorriendo = false;
      if (get('tb_run', false)) {
        const next = reintento ? Date.now() + 20000 : Math.max(Date.now() + 15000, t0 + cada * 1000);
        set('tb_next_farm', next);
        const st = get('tb_estado_farm', {});
        set('tb_estado_farm', Object.assign({}, st, { next }));
      }
    }
  }

  /* ───────────── arrancar / parar ───────────── */
  function arrancar() {
    const cfg = leerCfg();
    set('tb_origen', location.origin);
    set('tb_alarma', null);
    set('tb_run', true);
    soyLider(true);
    ss.del('tb_rol_actual');
    log('▶ ARRANCA (modo ' + String(cfg.modo || 'todo').toUpperCase() + ')');
    if (!get('tb_aldeas', []).length) {
      set('tb_scan', { activo: true, pend: null });
      log('primera vez: escaneo tus aldeas antes de empezar');
    }
    for (const r of ROLES) { set('tb_next_' + r, 0); set('tb_estado_' + r, { txt: 'arrancando', t: Date.now() }); }
  }
  function parar(motivo) {
    set('tb_run', false);
    ss.del('tb_rol_actual');
    log('■ DETENIDO' + (motivo ? ' — ' + motivo : ''));
    for (const r of ROLES) set('tb_estado_' + r, { txt: 'detenido', t: Date.now() });
  }

  /* ───────────── mensajes (misma interfaz que el service worker) ───────────── */
  async function atender(msg) {
    switch (msg.tipo) {
      case 'quienSoy': {
        const run = !!get('tb_run', false);
        const cfg = leerCfg();
        let rol = null;
        if (run && soyLider(false)) {
          // la farm list sale de acá mismo, sin ocupar la pestaña
          if (rolActivo(cfg, 'farm') && !farmCorriendo && Date.now() >= (get('tb_next_farm', 0) || 0)) await farmPorApi();
          rol = elegirRol(cfg);
        }
        return {
          rol, run, cfg,
          activo: rol ? rolActivo(cfg, rol) : false,
          origen: location.origin,
          next: rol ? get('tb_next_' + rol, 0) : 0,
          unidades: get('tb_unidades', {}),
          edificios: get('tb_edificios', {}),
          herreria: get('tb_herreria', {}),
          nextu: get('tb_nextu', {}),
          aldeas: get('tb_aldeas', []),
          scan: get('tb_scan', { activo: false }),
          rot: get('tb_rot', 0),
          farmPrimero: false, fila: 0, horas: {},
        };
      }
      case 'log':        log(msg.m, msg.rol); return { ok: true };
      case 'estado':     set('tb_estado_' + msg.rol, Object.assign({ t: Date.now() }, msg.st)); return { ok: true };
      // "programar" cierra el trabajo de ese rol: la próxima vez se elige de nuevo
      case 'programar':  set('tb_next_' + msg.rol, msg.next); if (ss.get('tb_rol_actual') === msg.rol) ss.del('tb_rol_actual'); return { ok: true };
      case 'trabajando': ss.set('tb_rol_actual', msg.rol); return { ok: true };
      case 'unidades':   set('tb_unidades', msg.unidades); return { ok: true };
      case 'edificios':  set('tb_edificios', msg.edificios); return { ok: true };
      case 'herreria':   set('tb_herreria', msg.herreria); return { ok: true };
      case 'nextu':      set('tb_nextu', msg.nextu); return { ok: true };
      case 'scan':       set('tb_scan', msg.scan); return { ok: true };
      case 'rot':        set('tb_rot', msg.rot); return { ok: true };
      case 'diag':       set('tb_diag', msg.diag); return { ok: true };
      case 'metrica': case 'slots': return { ok: true };
      case 'edificiosDe': { const e = get('tb_edificios', {}); e[String(msg.did)] = msg.slots; set('tb_edificios', e); return { ok: true }; }
      case 'herreriaDe':  { const h = get('tb_herreria', {}); h[String(msg.did)] = msg.filas; set('tb_herreria', h); return { ok: true }; }
      case 'aldeas': {
        const porDid = {};
        get('tb_aldeas', []).forEach(a => { porDid[String(a.did)] = a; });
        const generico = n => !n || /^aldea \d+$/.test(n);
        (msg.aldeas || []).forEach(a => {
          const v = porDid[String(a.did)];
          porDid[String(a.did)] = { did: String(a.did), nombre: (generico(a.nombre) && v && !generico(v.nombre)) ? v.nombre : a.nombre, tribu: a.tribu || (v && v.tribu) || 0 };
        });
        set('tb_aldeas', Object.values(porDid));
        return { ok: true };
      }
      case 'aldeasSync': {   // la lista de la derecha: entran las nuevas, salen las perdidas (si faltan >2, no borro)
        const viejas = get('tb_aldeas', []);
        const porDid = {};
        viejas.forEach(a => { porDid[String(a.did)] = a; });
        const nuevas = (msg.aldeas || []).filter(a => a && a.did).map(a => {
          const v = porDid[String(a.did)];
          return { did: String(a.did), nombre: a.nombre || (v && v.nombre) || ('aldea ' + a.did), tribu: (v && v.tribu) || 0 };
        });
        if (!nuevas.length) return { ok: false, aldeas: viejas };
        const ids = new Set(nuevas.map(a => a.did));
        let fuera = viejas.filter(a => !ids.has(String(a.did)));
        const entran = nuevas.filter(a => !porDid[a.did]);
        let lista = nuevas;
        if (fuera.length > 2) { lista = nuevas.concat(fuera); fuera = []; }
        set('tb_aldeas', lista);
        const cambios = [entran.length ? 'nueva(s): ' + entran.map(a => a.nombre).join(', ') : '',
                         fuera.length ? 'ya no está(n): ' + fuera.map(a => a.nombre).join(', ') : ''].filter(Boolean).join(' · ');
        if (cambios) log('aldeas: ' + cambios);
        return { ok: true, aldeas: lista, cambios };
      }
      case 'npc': {   // NPC con oro: cuántos van hoy
        const hoy = new Date().toLocaleDateString('sv');
        let c = get('tb_npc', {});
        if (c.dia !== hoy) c = { dia: hoy, n: 0 };
        if (msg.sumar) c.n++;
        if (msg.sinOro) c.sinOro = true;
        if (msg.sumar || msg.sinOro) set('tb_npc', c);
        return { ok: !c.sinOro && (msg.critico || c.n < (msg.max || 30)), n: c.n, sinOro: !!c.sinOro };
      }
      case 'unidadesDe': { const u = get('tb_unidades', {}); u[String(msg.clave)] = msg.filas || []; set('tb_unidades', u); return { ok: true }; }
      case 'listaEstado': {
        const e = get('tb_lista_estado', {}), t = Date.now();
        const vivas = new Set((msg.dids || []).map(String));
        Object.keys(e).forEach(d => { if (vivas.size && !vivas.has(d)) delete e[d]; });
        Object.keys(msg.est || {}).forEach(d => { e[d] = { t, txt: msg.est[d] }; });
        set('tb_lista_estado', e);
        return { ok: true };
      }
      case 'aldeaNombre': {
        const l = get('tb_aldeas', []);
        const i = l.findIndex(a => String(a.did) === String(msg.did));
        if (i >= 0) l[i].nombre = msg.nombre; else l.push({ did: String(msg.did), nombre: msg.nombre });
        set('tb_aldeas', l);
        return { ok: true };
      }
      case 'lock': case 'unlock': return { ok: true };   // una sola pestaña trabaja: no hace falta candado
      case 'alarma': set('tb_alarma', { t: Date.now(), m: msg.m }); parar(msg.m); return { ok: true };

      /* — desde el panel — */
      case 'arrancar': arrancar(); return { ok: true };
      case 'parar':    parar(); return { ok: true };
      case 'forzar':   set('tb_next_' + msg.rol, 0); return { ok: true };
      case 'abrir':    return { ok: true };
      case 'escanear': set('tb_scan', { activo: true, pend: null }); ss.del('tb_rol_actual'); log('🔍 escaneando aldeas y edificios…'); return { ok: true };
      case 'cancelarEscaneo': set('tb_scan', { activo: false }); return { ok: true };
      case 'estadoGeneral': {
        const cfg = leerCfg();
        const run = !!get('tb_run', false);
        const est = {};
        for (const r of ROLES) est[r] = { st: get('tb_estado_' + r, {}), next: get('tb_next_' + r, 0), viva: run && rolActivo(cfg, r) };
        return {
          run, cfg, est,
          log: get('tb_log', []), alarma: get('tb_alarma', null),
          unidades: get('tb_unidades', {}), edificios: get('tb_edificios', {}), herreria: get('tb_herreria', {}),
          aldeas: get('tb_aldeas', []), scan: get('tb_scan', { activo: false }), diag: get('tb_diag', null),
          lock: null, origen: location.origin,
          listaEstado: get('tb_lista_estado', {}),
          npc: get('tb_npc', {}),
        };
      }
      case 'guardarCfg':    set('tb_cfg', msg.cfg); return { ok: true };
      case 'limpiarAlarma': set('tb_alarma', null); return { ok: true };
      case 'limpiarLog':    set('tb_log', []); return { ok: true };
      default: return { ok: false, error: 'mensaje desconocido' };
    }
  }

  const bg = msg => atender(msg || {}).catch(e => ({ ok: false, error: String(e) }));
  return { bg, NOMBRE, soyLider: () => soyLider(false), liderId: () => (get('tb_lider', null) || {}).id, MI_ID };
})();
