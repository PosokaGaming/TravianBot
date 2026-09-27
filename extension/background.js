/*  Travian Bot · service worker (v3)
 *
 *  Es el dueño de las pestañas. Sabe qué rol tiene cada una, las abre, las
 *  cierra, las repone si se caen, guarda todo el estado compartido y reparte
 *  el candado de aldea (Travian tiene UNA aldea activa por sesión).
 *
 *  OJO: el service worker de MV3 se duerme. Nada de estado en variables:
 *  todo vive en chrome.storage.local.
 */

const ROLES  = ['tropas', 'heroe', 'farm', 'recursos'];
const NOMBRE = { tropas: 'Tropas', heroe: 'Héroe', farm: 'Farm list', recursos: 'Construcción' };

const CFG_DEF = {
  // plan = { '<did>': { '<gid>': { cada:[min,max] seg, u:[{t,min,max,usarMax}] } } }
  tropas  : { on: true, plan: {}, aldeas: 'todas', cada: [60, 90], cant: [5, 10], modo: 'iconos' },   // modo: 'iconos' (lista de aldeas + íconos verdes) | 'directo' (fetch)
  heroe   : { on: true, saludMin: 30, exigirSalud: true, elegir: 'corta', cadaSeg: 69 },
  farm    : { on: true, listas: 'todas', cadaSeg: 69, did: '', modo: 'api' },   // modo 'api' (service worker) | 'pagina' (botón en la pestaña)
  // aldeas = { '<did>': { campos:{on,nivelMax,tipos}, edificios:[{gid,nivelMax}],
  //            herreria:[{u,nivelMax}], npc:{on,umbral}, oro:{terminar} } }
  recursos: { on: true, cada: [180, 300], unaPorVuelta: true, aldeas: {} },
  modo: 'tropas',   // 'tropas' | 'farm' | 'construccion' | 'todo' — el modo elegido usa las pestañas; farm y héroe siguen de fondo
  cerrarAlParar: true,
  debug: false,
};

const RUTA = {
  tropas  : '/dorf2.php',
  heroe   : '/hero/attributes',
  farm    : '/build.php?gid=16&tt=99',
  recursos: '/dorf1.php',
};

/* ───────────── fila ─────────────
   Todo lo que lee-y-escribe el storage pasa en fila, de a uno. Sin esto, dos
   pestañas pidiendo el candado a la vez lo recibían las dos (el get/set no es
   atómico), el log perdía líneas y el vigilante abría pestañas repetidas. */
let fila = Promise.resolve();
const enFila = fn => { const p = fila.then(fn, fn); fila = p.catch(() => {}); return p; };

/* ───────────── storage ─────────────
   Caché en memoria delante de chrome.storage: TODAS las escrituras pasan por
   este service worker (pestañas y panel le mandan mensajes), así que la copia
   en memoria es la verdad mientras está despierto. Con la PC cargada, tres
   lecturas del storage tardaban 2-10 s por consulta (medido el 26/09). Al
   despertarse vacío, lee del storage la primera vez. */
const CACHE = new Map();
const get = async (k, d) => {
  if (!CACHE.has(k)) { const o = await chrome.storage.local.get(k); if (!CACHE.has(k)) CACHE.set(k, o[k]); }
  const v = CACHE.get(k);
  return v === undefined ? d : v;
};
const set = (k, v) => { CACHE.set(k, v); chrome.storage.local.set({ [k]: v }).catch(() => {}); return Promise.resolve(); };
const esObjeto = v => !!v && typeof v === 'object' && !Array.isArray(v);

async function leerCfg() {
  const c = await get('tb_cfg', null);
  const out = JSON.parse(JSON.stringify(CFG_DEF));
  if (esObjeto(c)) {
    for (const k of Object.keys(out)) {
      if (c[k] === undefined) continue;
      if (esObjeto(out[k])) Object.assign(out[k], c[k]);
      else out[k] = c[k];
    }
  }
  // formatos viejos: plan de tropas como array, aldeas de recursos como lista
  const pl = out.tropas.plan || {};
  if (Object.values(pl).some(g => Object.values(g || {}).some(e => Array.isArray(e)))) out.tropas.plan = {};
  if (!esObjeto(out.recursos.aldeas)) out.recursos.aldeas = {};
  return out;
}

async function log(msg, rol) {
  const l = await get('tb_log', []);
  l.push({ t: Date.now(), r: rol || 'fondo', m: String(msg) });
  while (l.length > 150) l.shift();
  await set('tb_log', l);
}

/* ───────────── pestañas ───────────── */

const tabsMapa = () => get('tb_tabs', {});
const guardarTabs = m => set('tb_tabs', m);

async function rolDeTab(tabId) {
  const m = await tabsMapa();
  for (const r of ROLES) if (m[r] === tabId) return r;
  return null;
}
async function existeTab(tabId) {
  if (!tabId) return false;
  try { await chrome.tabs.get(tabId); return true; } catch (e) { return false; }
}

async function abrirPestana(rol) {
  const origen = await get('tb_origen', '');
  if (!origen) { await log('no sé en qué servidor estás — abrí Travian y volvé a darle play'); return null; }
  const m = await tabsMapa();
  if (await existeTab(m[rol])) {
    try { await chrome.tabs.update(m[rol], { url: origen + RUTA[rol] }); } catch (e) {}
    return m[rol];
  }
  const tab = await chrome.tabs.create({ url: origen + RUTA[rol], active: false });
  m[rol] = tab.id;
  await guardarTabs(m);
  const propias = await get('tb_propias', []);
  propias.push(tab.id);
  await set('tb_propias', propias.slice(-40));
  await set('tb_next_' + rol, 0);
  await log('abro la pestaña de ' + NOMBRE[rol], rol);
  return tab.id;
}

/* Pestañas que sobran (pedido del usuario el 26/09).
   - huerfanas: las que abrió el bot y ya no tienen rol (quedaban al reponer
     pestañas: la vieja seguía abierta). Esto corre en cada vigilancia.
   - todas: además cualquier otra pestaña de ESTE servidor de Travian que no
     sea del bot, salvo la que estás mirando (activa) y las que están en un
     grupo de pestañas. Sólo al arrancar o al actualizar la extensión. */
async function limpiarPestanas(todas) {
  const m = await tabsMapa();
  const nuestras = new Set(ROLES.map(r => m[r]).filter(Boolean));
  const propias = await get('tb_propias', []);
  const origen = await get('tb_origen', '');
  let host = '';
  try { host = new URL(origen).host; } catch (e) {}
  let tabs = [];
  try { tabs = await chrome.tabs.query({}); } catch (e) { return; }
  let n = 0;
  for (const t of tabs) {
    if (nuestras.has(t.id)) continue;
    let deTravian = false;
    try { deTravian = !!host && new URL(t.url || t.pendingUrl || '').host === host; } catch (e) {}
    const huerfana = propias.indexOf(t.id) >= 0;
    if (!huerfana && !(todas && deTravian && !t.active && (t.groupId === undefined || t.groupId === -1))) continue;
    try { await chrome.tabs.remove(t.id); n++; } catch (e) {}
  }
  const vivas = new Set(tabs.map(t => t.id));
  // de acá en más cuento como propias las del bot: si alguna se reemplaza, la vieja se cierra
  await set('tb_propias', Array.from(new Set(propias.filter(id => vivas.has(id) && nuestras.has(id)).concat(Array.from(nuestras)))));
  if (n) await log('cerré ' + n + ' pestaña(s) de Travian que no usaba el bot');
}

async function cerrarPestana(rol) {
  const m = await tabsMapa();
  const id = m[rol];
  delete m[rol];
  await guardarTabs(m);
  if (await existeTab(id)) { try { await chrome.tabs.remove(id); } catch (e) {} }
}

/* ───────────── arrancar / parar ───────────── */

async function arrancar(origen) {
  if (origen) await set('tb_origen', origen);
  const cfg = await leerCfg();
  await set('tb_alarma', null);
  await set('tb_lock', null);
  await set('tb_espera', {});
  await set('tb_run', true);
  await log('▶ ARRANCA');

  // primera vez: sin aldeas escaneadas no hay nada que hacer, escaneo solo
  const aldeas = await get('tb_aldeas', []);
  let escanear = false;
  if (!aldeas.length) {
    escanear = true;
    await set('tb_scan', { activo: true, pend: null });
    await log('primera vez: escaneo tus aldeas antes de empezar');
  }

  for (const r of ROLES) {
    await set('tb_next_' + r, 0);
    await set('tb_lease_' + r, 0);
    await set('tb_estado_' + r, { txt: 'arrancando', t: Date.now() });
    if (tabNecesaria(cfg, r) || (r === 'tropas' && escanear)) { await abrirPestana(r); await new Promise(r2 => setTimeout(r2, 500)); }
  }
  chrome.alarms.create('tb_vigilar', { periodInMinutes: 1 });
  await limpiarPestanas(true);
  farmPorApi();   // la farm list sale ya, sin esperar a ninguna pestaña
}

async function parar(motivo) {
  await set('tb_run', false);
  await set('tb_lock', null);
  await set('tb_espera', {});
  await log('■ DETENIDO' + (motivo ? ' — ' + motivo : ''));
  const cfg = await leerCfg();
  for (const r of ROLES) {
    await set('tb_estado_' + r, { txt: 'detenido', t: Date.now() });
    if (cfg.cerrarAlParar) await cerrarPestana(r);
  }
  chrome.alarms.clear('tb_vigilar');
  chrome.alarms.clear('tb_farm');
}

/* ───────────── modos (pedido del usuario el 27/09) ─────────────
   MODO TROPAS / FARM / CONSTRUCCIÓN: el bot se dedica al modo elegido. La
   farm list y el héroe siguen de fondo (si están encendidos en el panel); lo
   demás queda pausado y su pestaña se cierra para no gastar CPU. 'todo' =
   como antes, todo a la vez. */
const MODO_ROL = { tropas: 'tropas', farm: 'farm', construccion: 'recursos' };
function rolActivo(cfg, r) {
  if (!cfg[r] || !cfg[r].on) return false;
  const modo = cfg.modo || 'todo';
  if (modo === 'todo' || r === 'heroe' || r === 'farm') return true;
  return MODO_ROL[modo] === r;
}
// ¿necesita pestaña? la farm list por API sólo muestra su pestaña en MODO FARM o TODO
function tabNecesaria(cfg, r) {
  if (!rolActivo(cfg, r)) return false;
  if (r === 'farm' && farmPorApiOn(cfg)) return ['farm', 'todo'].indexOf(cfg.modo || 'todo') >= 0;
  return true;
}

/* ───────────── vigilante ─────────────
   Cada minuto: repone pestañas caídas, cierra las de lo que está pausado y
   destraba las que se quedaron colgadas. */
async function vigilar() {
  if (!(await get('tb_run', false))) return;
  await limpiarPestanas(false);
  const cfg = await leerCfg();
  const m = await tabsMapa();
  for (const r of ROLES) {
    if (r === 'farm' && rolActivo(cfg, r) && farmPorApiOn(cfg)) {
      // la farm list la manda el service worker: si la alarma se perdió, la mando ya
      const nf = await get('tb_next_farm', 0);
      if (!nf || Date.now() - nf > 30000) farmPorApi();
    }
    if (!tabNecesaria(cfg, r)) {
      if (await existeTab(m[r])) { await log('cierro la pestaña de ' + NOMBRE[r] + ' (' + (rolActivo(cfg, r) ? 'la farm list sale de fondo' : cfg[r].on ? 'pausada por el MODO ' + String(cfg.modo).toUpperCase() : 'apagada') + ')', r); await cerrarPestana(r); }
      await set('tb_estado_' + r, { t: Date.now(), txt: rolActivo(cfg, r) ? 'de fondo' : cfg[r].on ? 'pausado (modo ' + String(cfg.modo || 'todo').toUpperCase() + ')' : 'apagado' });
      continue;
    }
    if (!(await existeTab(m[r]))) {
      await log('la pestaña de ' + NOMBRE[r] + ' no está, la repongo', r);
      await abrirPestana(r);
      continue;
    }
    // ¿se quedó colgada? (pasó su turno hace más de 45 s y no está trabajando)
    const next  = await get('tb_next_' + r, 0);
    const lease = await get('tb_lease_' + r, 0);
    if (r === 'farm' && farmPorApiOn(cfg)) continue;   // su pestaña sólo muestra
    if (next && Date.now() - next > 45000 && Date.now() > lease) {
      await log('la pestaña de ' + NOMBRE[r] + ' se atrasó, la recargo', r);
      try { await chrome.tabs.reload(m[r]); } catch (e) {}
      await set('tb_next_' + r, Date.now() + 15000);
    }
  }
}
chrome.alarms.onAlarm.addListener(a => {
  if (a.name === 'tb_vigilar') enFila(vigilar);
  if (a.name === 'tb_farm') farmPorApi();
});

/* ───────────── farm list desde el service worker (PRIORIDAD 1) ─────────────
   Hace lo mismo que el botón "Start all farm lists", sin cargar ni dibujar la
   página (con la PC cargada Chrome le daba tan poca CPU a la pestaña que un
   envío tardaba hasta 6 min):
   1. GET /build.php?gid=16&tt=99 → el HTML trae en `viewData` todas las
      listas con sus objetivos (farmLists[].slotsStates[{id,isActive}]).
   2. Por cada lista con objetivos activos, en serie como el botón:
      POST /api/v1/farm-list/send  {"action":"farmList","lists":[{"id",
      "targets":[ids activos]}],"startedAll":true}  (las siguientes llevan
      "triggeredBySendAll":true). Verificado capturando el botón el 26/09.
   La pestaña de farm list queda abierta sólo para mirar. */
const farmPorApiOn = cfg => (cfg.farm.modo || 'api') === 'api';
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
    const cfg = await leerCfg();
    if (!(await get('tb_run', false)) || !rolActivo(cfg, 'farm') || !farmPorApiOn(cfg)) return;
    cada = Math.max(30, Number(cfg.farm.cadaSeg) || 69);
    const origen = await get('tb_origen', '');
    if (!origen) return;
    await set('tb_lease_farm', t0 + 120000);
    await set('tb_estado_farm', { t: t0, txt: 'enviando…' });

    const r = await fetch(origen + '/build.php?gid=16&tt=99', { credentials: 'include' });
    const h = await r.text();
    if (/id="botprotection"|class="botProtection"|name="botprotection"|id="bot_check"/i.test(h)) {
      await set('tb_alarma', { t: Date.now(), m: 'Captcha / control antibot (farm list)' });
      await parar('Captcha / control antibot (farm list)');
      return;
    }
    if (h.indexOf('villageInput') < 0) { await log('farm: la página no trae la sesión (HTTP ' + r.status + '), reintento', 'farm'); reintento = true; return; }
    const k = h.indexOf('viewData:');
    const vd = k >= 0 ? objetoJSON(h, k) : null;
    const listas = vd && vd.ownPlayer && vd.ownPlayer.farmLists;
    if (!Array.isArray(listas)) { await log('farm: no encuentro las listas en la página, reintento', 'farm'); reintento = true; return; }
    if (vd.ownPlayer.accessRights && vd.ownPlayer.accessRights.sendRaids === false) { await log('farm: la cuenta no tiene permiso de mandar atracos', 'farm'); return; }

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
        if (!(await get('tb_sonda_send', null))) await set('tb_sonda_send', { t: Date.now(), status: rr.status, txt: txt.slice(0, 600) });
        if (rr.ok) ok.push(l.nombre + ' (' + l.targets.length + ')');
        else mal.push(l.nombre + ': HTTP ' + rr.status + ' ' + txt.slice(0, 80));
      } catch (e) { mal.push(l.nombre + ': ' + (e && e.message ? e.message : e)); }
      await new Promise(ok2 => setTimeout(ok2, 300 + Math.random() * 500));
    }
    const sinObj = listas.length - elegidas.length;
    await log('farm: ' + ok.length + '/' + elegidas.length + ' lista(s) enviadas ✔ ' + ok.join(', ') +
              (mal.length ? ' — FALLARON: ' + mal.join(' | ') : '') + (sinObj ? ' (' + sinObj + ' sin objetivos)' : ''), 'farm');
    await set('tb_estado_farm', { t: Date.now(), txt: ok.length + ' lista(s) enviadas', ult: new Date().toLocaleTimeString('es-AR', { hour12: false }) });
    if (!ok.length && mal.length) reintento = true;
  } catch (e) {
    await log('farm: ' + (e && e.message ? e.message : e) + ', reintento', 'farm');
    reintento = true;
  } finally {
    farmCorriendo = false;
    if (await get('tb_run', false)) {
      const next = reintento ? Date.now() + 20000 : Math.max(Date.now() + 15000, t0 + cada * 1000);
      await set('tb_next_farm', next);
      await set('tb_lease_farm', 0);
      const st = await get('tb_estado_farm', {});
      await set('tb_estado_farm', Object.assign({}, st, { next }));
      chrome.alarms.create('tb_farm', { when: next });
    }
  }
}

/* si cerrás una pestaña del bot a mano, la repongo */
chrome.tabs.onRemoved.addListener(tabId => enFila(async () => {
  if (!(await get('tb_run', false))) return;
  const rol = await rolDeTab(tabId);
  if (!rol) return;
  const m = await tabsMapa();
  delete m[rol];
  await guardarTabs(m);
  const cfg = await leerCfg();
  if (tabNecesaria(cfg, rol)) {
    await log('cerraste la pestaña de ' + NOMBRE[rol] + ', la vuelvo a abrir', rol);
    setTimeout(() => enFila(async () => {
      if (!(await get('tb_run', false))) return;
      if (await existeTab((await tabsMapa())[rol])) return;   // el vigilante ya la repuso
      await abrirPestana(rol);
    }), 1500);
  }
}));

/* ───────────── candado de aldea ─────────────
   Una sola pestaña cambia de aldea a la vez. Vence solo a los 90 s por si la
   pestaña que lo tenía murió. */
const LOCK_TTL = 90000;   // con la PC cargada una página tarda 30+ s: a los 30 s se lo sacaban a mitad de paso
/* Turno justo: si alguien está esperando desde antes, el candado libre es de
   él, no del primero que lo pida. Si no, Tropas (que encadena muchas páginas)
   se lo quedaría siempre y Construcción nunca entraría. */
async function tomarLock(rol, did) {
  const t = Date.now();
  const l = await get('tb_lock', null);
  const esp = await get('tb_espera', {});
  Object.keys(esp).forEach(r => { if (t - esp[r] > 180000) delete esp[r]; });   // 3 min: con la PC lenta un reintento tarda más de 1 min
  const tomar = async () => { delete esp[rol]; await set('tb_espera', esp); await set('tb_lock', { rol, did: String(did), t }); return { ok: true }; };
  if (l && l.rol === rol) return tomar();
  const libre = !l || t - l.t > LOCK_TTL;
  if (libre) {
    const antes = Object.keys(esp).filter(r => r !== rol && (!esp[rol] || esp[r] < esp[rol]));
    if (!antes.length) return tomar();
    if (!esp[rol]) { esp[rol] = t; await set('tb_espera', esp); }
    return { ok: false, quien: antes[0] };
  }
  if (!esp[rol]) { esp[rol] = t; await set('tb_espera', esp); }
  return { ok: false, quien: l.rol, did: l.did };
}
async function soltarLock(rol) {
  const l = await get('tb_lock', null);
  if (l && l.rol === rol) await set('tb_lock', null);
  const esp = await get('tb_espera', {});
  if (esp[rol]) { delete esp[rol]; await set('tb_espera', esp); }
}

/* ───────────── mensajes ───────────── */

chrome.runtime.onMessage.addListener((msg, sender, responder) => {
  const recibido = Date.now();
  /* En fila SÓLO lo que lee-modifica-escribe. Las lecturas y las escrituras
     simples van directo: con 4 pestañas preguntando cada 2 s, meter todo en
     fila la saturaba (medido: 5-13 s de espera por mensaje). */
  const DIRECTO = ['quienSoy', 'estadoGeneral', 'estado', 'programar', 'trabajando', 'unidades', 'edificios',
                   'herreria', 'nextu', 'scan', 'rot', 'diag', 'slots', 'guardarCfg', 'limpiarAlarma', 'limpiarLog'];
  const correr = DIRECTO.indexOf(msg && msg.tipo) >= 0 ? (fn => fn()) : enFila;
  correr(async () => {
    const tabId = sender && sender.tab ? sender.tab.id : null;
    const enCola = Date.now() - recibido;   // cuánto esperó en la fila

    switch (msg.tipo) {

      /* — desde el content script — (4 pestañas × cada 2 s: una sola lectura) */
      case 'quienSoy': {
        const inicio = Date.now();
        const o = {};
        for (const k of ['tb_tabs', 'tb_run', 'tb_unidades', 'tb_edificios', 'tb_herreria', 'tb_nextu', 'tb_aldeas', 'tb_scan', 'tb_rot']) o[k] = await get(k);
        const m = o.tb_tabs || {};
        const rol = tabId ? (ROLES.find(r => m[r] === tabId) || null) : null;
        const cfg = await leerCfg();
        const next = rol ? await get('tb_next_' + rol, 0) : 0;
        // prioridad 1: la farm list está trabajando, o le toca y no está colgada (menos de 60 s tarde)
        let farmPrimero = false;
        if (rol && rol !== 'farm' && cfg.farm.on) {
          const t = Date.now(), fl = await get('tb_lease_farm', 0), fn = await get('tb_next_farm', 0);
          farmPrimero = false && (fl > t || (!!fn && fn <= t + 3000 && t - fn < 60000));   // apagado: con la farm tardando minutos, Tropas quedaba parada
        }
        responder({
          horas: { recibido, inicio, fin: Date.now() },
          farmPrimero,
          activo: rol ? rolActivo(cfg, rol) : false,
          origen: await get('tb_origen', ''),
          rol,
          run: !!o.tb_run,
          cfg,
          next,
          unidades: o.tb_unidades || {},
          edificios: o.tb_edificios || {},
          herreria: o.tb_herreria || {},
          nextu: o.tb_nextu || {},
          aldeas: o.tb_aldeas || [],
          scan: o.tb_scan || { activo: false },
          rot: o.tb_rot || 0,
          fila: enCola,
        });
        break;
      }
      case 'metrica': {
        const l = await get('tb_metrica', []);
        l.push(Object.assign({ t: Date.now() }, msg.m));
        while (l.length > 40) l.shift();
        await set('tb_metrica', l);
        responder({ ok: true });
        break;
      }
      case 'log':        await log(msg.m, msg.rol); responder({ ok: true }); break;
      case 'estado':     await set('tb_estado_' + msg.rol, Object.assign({ t: Date.now() }, msg.st)); responder({ ok: true }); break;
      case 'programar':  await set('tb_next_' + msg.rol, msg.next); await set('tb_lease_' + msg.rol, 0); responder({ ok: true }); break;
      case 'trabajando': await set('tb_lease_' + msg.rol, Date.now() + 120000); responder({ ok: true }); break;
      case 'unidades':   await set('tb_unidades', msg.unidades); responder({ ok: true }); break;
      case 'edificios':  await set('tb_edificios', msg.edificios); responder({ ok: true }); break;
      case 'herreria':   await set('tb_herreria', msg.herreria); responder({ ok: true }); break;
      case 'nextu':      await set('tb_nextu', msg.nextu); responder({ ok: true }); break;
      case 'scan':       await set('tb_scan', msg.scan); responder({ ok: true }); break;
      case 'rot':        await set('tb_rot', msg.rot); responder({ ok: true }); break;
      case 'diag':       await set('tb_diag', msg.diag); responder({ ok: true }); break;
      case 'slots':      responder({ ok: true }); break;

      case 'edificiosDe': {   // refresco de niveles de UNA aldea (lo manda la pestaña de construcción)
        const e = await get('tb_edificios', {});
        e[String(msg.did)] = msg.slots;
        await set('tb_edificios', e);
        responder({ ok: true });
        break;
      }
      case 'herreriaDe': {
        const h = await get('tb_herreria', {});
        h[String(msg.did)] = msg.filas;
        await set('tb_herreria', h);
        responder({ ok: true });
        break;
      }
      case 'aldeas': {
        // no piso un nombre bueno con uno genérico "aldea 12345"
        const viejas = await get('tb_aldeas', []);
        const porDid = {};
        viejas.forEach(a => { porDid[String(a.did)] = a; });
        const generico = n => !n || /^aldea \d+$/.test(n);
        (msg.aldeas || []).forEach(a => {
          const v = porDid[String(a.did)];
          porDid[String(a.did)] = {
            did: String(a.did),
            nombre: (generico(a.nombre) && v && !generico(v.nombre)) ? v.nombre : a.nombre,
            tribu: a.tribu || (v && v.tribu) || 0,
          };
        });
        await set('tb_aldeas', Object.values(porDid));
        responder({ ok: true });
        break;
      }
      case 'aldeaNombre': {
        const l = await get('tb_aldeas', []);
        const i = l.findIndex(a => String(a.did) === String(msg.did));
        if (i >= 0) l[i].nombre = msg.nombre; else l.push({ did: String(msg.did), nombre: msg.nombre });
        await set('tb_aldeas', l);
        responder({ ok: true });
        break;
      }
      case 'lock':   responder(await tomarLock(msg.rol, msg.did)); break;
      case 'unlock': await soltarLock(msg.rol); responder({ ok: true }); break;

      case 'alarma':
        await set('tb_alarma', { t: Date.now(), m: msg.m });
        await parar(msg.m);
        responder({ ok: true });
        break;

      /* — desde el panel — */
      case 'arrancar': await arrancar(msg.origen); responder({ ok: true }); break;
      case 'parar':    await parar(); responder({ ok: true }); break;

      case 'forzar': {
        await set('tb_next_' + msg.rol, 0);
        const m2 = await tabsMapa();
        if (await existeTab(m2[msg.rol])) { try { await chrome.tabs.reload(m2[msg.rol]); } catch (e) {} }
        responder({ ok: true });
        break;
      }
      case 'abrir':
        if (msg.origen) await set('tb_origen', msg.origen);
        await abrirPestana(msg.rol);
        responder({ ok: true });
        break;

      /* escanear todas las aldeas. Necesita la pestaña de Tropas; si no está, la abro. */
      case 'escanear': {
        if (msg.origen) await set('tb_origen', msg.origen);
        await set('tb_scan', { activo: true, pend: null });
        await set('tb_lock', null);
        await log('🔍 escaneando aldeas y edificios…');
        const mt = await tabsMapa();
        if (await existeTab(mt.tropas)) { try { await chrome.tabs.reload(mt.tropas); } catch (e) {} }
        else await abrirPestana('tropas');
        responder({ ok: true });
        break;
      }
      case 'cancelarEscaneo': await set('tb_scan', { activo: false }); responder({ ok: true }); break;

      case 'estadoGeneral': {
        const cfg = await leerCfg();
        const m3 = await tabsMapa();
        const est = {};
        for (const r of ROLES) {
          est[r] = { st: await get('tb_estado_' + r, {}), next: await get('tb_next_' + r, 0), viva: await existeTab(m3[r]) };
        }
        responder({
          run: await get('tb_run', false),
          cfg, est,
          log: await get('tb_log', []),
          alarma: await get('tb_alarma', null),
          unidades: await get('tb_unidades', {}),
          edificios: await get('tb_edificios', {}),
          herreria: await get('tb_herreria', {}),
          aldeas: await get('tb_aldeas', []),
          scan: await get('tb_scan', { activo: false }),
          diag: await get('tb_diag', null),
          lock: await get('tb_lock', null),
          origen: await get('tb_origen', ''),
        });
        break;
      }
      case 'guardarCfg':    await set('tb_cfg', msg.cfg); responder({ ok: true }); enFila(vigilar); break;
      case 'limpiarAlarma': await set('tb_alarma', null); responder({ ok: true }); break;
      case 'limpiarLog':    await set('tb_log', []); responder({ ok: true }); break;

      default: responder({ ok: false, error: 'mensaje desconocido' });
    }
  }).catch(e => { try { responder({ ok: false, error: String(e) }); } catch (e2) {} });
  return true;   // respuesta asincrónica
});

/* Instalar de cero = detenido. Recargar la extensión (↻, una versión nueva)
   NO lo apaga: si estaba andando sigue, recargo sus pestañas para que tomen
   el content script nuevo y vuelvo a poner el vigilante. */
chrome.runtime.onInstalled.addListener(d => enFila(async () => {
  await set('tb_lock', null);
  await set('tb_espera', {});
  if (d && d.reason === 'install') { await set('tb_run', false); await log('extensión instalada'); return; }
  const v = chrome.runtime.getManifest().version;
  // pedido del usuario el 27/09: MODO TROPAS, farm list apagada y dejarlo andando (una sola vez)
  if (!(await get('tb_mig_0927', false))) {
    const c = (await get('tb_cfg', null)) || {};
    c.modo = 'tropas';
    c.farm = Object.assign({}, c.farm || {}, { on: false });
    await set('tb_cfg', c);
    await set('tb_mig_0927', true);
    chrome.alarms.clear('tb_farm');
    await log('v' + v + ': MODO TROPAS · farm list apagada (se vuelve a prender en el panel) · arranco');
    await arrancar();
    return;
  }
  if (!(await get('tb_run', false))) { await log('extensión actualizada a v' + v + ' (detenido)'); return; }
  await log('extensión actualizada a v' + v + ' — sigo andando');
  chrome.alarms.create('tb_vigilar', { periodInMinutes: 1 });
  const m = await tabsMapa();
  for (const r of ROLES) {
    await set('tb_next_' + r, 0);
    await set('tb_lease_' + r, 0);
    if (await existeTab(m[r])) { try { await chrome.tabs.reload(m[r]); } catch (e) {} await new Promise(ok => setTimeout(ok, 700)); }
  }
  await limpiarPestanas(true);
  farmPorApi();
}));

/* Chrome se reinició: los tabId viejos no valen. El vigilante abre pestañas nuevas. */
chrome.runtime.onStartup.addListener(() => enFila(async () => {
  if (!(await get('tb_run', false))) return;
  await set('tb_tabs', {});
  await set('tb_lock', null);
  await set('tb_espera', {});
  chrome.alarms.create('tb_vigilar', { periodInMinutes: 1 });
  await log('Chrome arrancó y el bot estaba andando: repongo las pestañas');
  await vigilar();
}));
