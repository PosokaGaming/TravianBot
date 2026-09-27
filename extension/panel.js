/*  Travian Bot · panel (popup del ícono) v3
 *  No tiene lógica de juego: le pregunta todo al service worker y le manda
 *  órdenes. Por eso se puede cerrar y abrir sin afectar al bot.
 */

const ROLES  = ['tropas', 'heroe', 'farm', 'recursos'];
const NOMBRE = { tropas: 'Tropas', heroe: 'Héroe', farm: 'Farm list', recursos: 'Construcción' };
const MILITARES = [19, 20, 21, 29, 30];
const GIDS   = { 19: 'Cuartel', 20: 'Establo', 21: 'Taller', 29: 'Gran cuartel', 30: 'Gran establo' };
const GIDS_TODOS = {
  5: 'Aserradero', 6: 'Fábrica de ladrillos', 7: 'Fundición', 8: 'Molino', 9: 'Panadería',
  10: 'Almacén', 11: 'Granero', 13: 'Herrería', 14: 'Plaza de torneos', 15: 'Edificio principal',
  16: 'Punto de reunión', 17: 'Mercado', 18: 'Embajada', 19: 'Cuartel', 20: 'Establo', 21: 'Taller',
  22: 'Academia', 23: 'Escondite', 24: 'Ayuntamiento', 25: 'Residencia', 26: 'Palacio', 27: 'Tesorería',
  28: 'Oficina de comercio', 29: 'Gran cuartel', 30: 'Gran establo', 31: 'Muralla', 32: 'Empalizada',
  33: 'Terraplén', 34: 'Cantero', 35: 'Cervecería', 36: 'Trampero', 37: 'Mansión del héroe',
  38: 'Gran almacén', 39: 'Gran granero', 41: 'Abrevadero', 42: 'Muro de piedra', 44: 'Centro de mando',
  45: 'Acueducto', 46: 'Hospital',
};
const RECURSO = { 1: 'madera', 2: 'barro', 3: 'hierro', 4: 'cereal' };
const TRIBU = { 1: 'Romano', 2: 'Teutón', 3: 'Galo', 4: 'Naturaleza', 5: 'Natar', 6: 'Egipcio', 7: 'Huno', 8: 'Espartano' };
const conTribu = a => a.nombre + (a.tribu ? ' · ' + (TRIBU[a.tribu] || 'tribu ' + a.tribu) : '');

const bg   = msg => new Promise(res => chrome.runtime.sendMessage(msg, r => { void chrome.runtime.lastError; res(r || {}); }));
const hhmm = t => new Date(t).toLocaleTimeString('es-AR', { hour12: false });
const num  = t => { const s = String(t == null ? '' : t).replace(/[^\d]/g, ''); return s ? parseInt(s, 10) : 0; };
const esc  = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

let ESTADO = null;
let firmaEstructura = '';

/* qué aldea se está mirando en cada tarjeta: preferencia de vista, vive en el popup */
const ui = {
  get: (k, d) => { try { return localStorage.getItem('tb_ui_' + k) || d; } catch (e) { return d; } },
  set: (k, v) => { try { localStorage.setItem('tb_ui_' + k, v); } catch (e) {} },
};

async function origenActivo() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url && /^https?:/.test(tab.url)) {
      const u = new URL(tab.url);
      if (/travian/i.test(u.hostname)) return u.origin;
    }
  } catch (e) {}
  return '';
}

function desplegableAldeas(aldeas, sel, id, extra) {
  return `<select id="${id}">` + (extra || '') + aldeas.map(a =>
    `<option value="${a.did}"${String(sel) === String(a.did) ? ' selected' : ''}>${esc(a.nombre)}</option>`
  ).join('') + `</select>`;
}
function aldeaVisible(clave, aldeas) {
  let sel = ui.get(clave, '');
  if (!aldeas.some(a => String(a.did) === String(sel))) sel = aldeas[0].did;
  return aldeas.find(a => String(a.did) === String(sel));
}

/* ═══════════ TROPAS ═══════════ */

function cuentaPlan(c, did) {
  let n = 0;
  Object.values((c.plan || {})[did] || {}).forEach(e => { n += (e && e.u) ? e.u.length : 0; });
  return n;
}
function edificioPlan(c, did, gid) {
  const e = (c.plan[did] || {})[gid];
  if (!e || !e.u) return null;
  return { cada: Array.isArray(e.cada) ? e.cada : (c.cada || [60, 90]), u: e.u };
}

function cuerpoTropas(cfg, aldeas, unidades, scan) {
  const c = cfg.tropas;
  const defCada = c.cada || [60, 90];
  const defCant = c.cant || [5, 10];

  const cab =
    `<label>por defecto: revisar cada ` +
      `<input type="number" min="5" data-cfg="tropas.cada.0" value="${defCada[0]}" style="width:48px"> a ` +
      `<input type="number" min="5" data-cfg="tropas.cada.1" value="${defCada[1]}" style="width:48px"> s</label>` +
    `<div class="fila">` +
      `<button class="mini escanear" id="escanear">🔍 escanear aldeas</button>` +
      `<span class="hint">${
        scan && scan.activo
          ? (scan.pend ? `escaneando… faltan ${scan.pend.length} aldea(s)` : 'buscando aldeas…')
          : (aldeas.length ? `${aldeas.length} aldea(s)` : 'todavía no escaneé nada')
      }</span>` +
    `</div>`;

  if (!aldeas.length) {
    return cab + `<div class="hint">Dale a <b>escanear</b> (o a ARRANCAR: la primera vez escanea solo). Recorre todas tus aldeas y anota edificios, tropas y herrería de cada una.</div>`;
  }

  const todas = (c.aldeas === 'todas' || !Array.isArray(c.aldeas));
  const aldea = aldeaVisible('aldeaTropas', aldeas);
  const did = String(aldea.did);
  const activa = todas || c.aldeas.indexOf(did) >= 0;

  let h = cab +
    `<label class="chk"><input type="checkbox" id="todasaldeas"${todas ? ' checked' : ''}> entrenar en todas las aldeas</label>` +
    `<div class="fila"><span class="hint">ver aldea</span>` +
      desplegableAldeas(aldeas.map(a => ({ did: a.did, nombre: conTribu(a) + (cuentaPlan(c, String(a.did)) ? ' ●' : '') })), did, 'veraldea') +
      (todas ? '' : `<label class="chk"><input type="checkbox" data-aldea="${did}"${activa ? ' checked' : ''}> entrenar acá</label>`) +
    `</div>`;

  let cuerpo = '';
  MILITARES.forEach(gid => {
    const us = unidades[did + '|' + gid];
    if (!us || !us.length) return;
    const ed = edificioPlan(c, did, gid);
    const cada = ed ? ed.cada : defCada;
    const bk = `${did}|${gid}`;
    cuerpo += `<div class="edif">` +
      `<div class="edifh"><span class="edifn">${GIDS[gid]}</span>` +
        `<span class="hint">revisar cada</span>` +
        `<input type="number" min="5" data-bmin="${bk}" value="${cada[0]}" style="width:46px">` +
        `<span class="hint">a</span>` +
        `<input type="number" min="5" data-bmax="${bk}" value="${cada[1]}" style="width:46px">` +
        `<span class="hint">s</span>` +
      `</div>` +
      us.map(u => {
        const p = ed ? (ed.u || []).find(x => x.t === u.t) : null;
        const k = `${did}|${gid}|${u.t}`;
        const mn = p && p.min != null ? p.min : defCant[0];
        const mx = p && p.max != null ? p.max : defCant[1];
        const um = p ? !!p.usarMax : false;
        return `<div class="u">` +
          `<label class="chk"><input type="checkbox" data-u="${k}"${p ? ' checked' : ''}>${esc(u.nombre)}</label>` +
          `<input type="number" min="1" data-umin="${k}" value="${mn}" title="mínimo por pasada" style="width:44px"${um ? ' disabled' : ''}>` +
          `<span class="hint">a</span>` +
          `<input type="number" min="1" data-umax="${k}" value="${mx}" title="máximo por pasada" style="width:44px"${um ? ' disabled' : ''}>` +
          `<label class="chk" title="todo lo que alcancen los recursos"><input type="checkbox" data-umaxchk="${k}"${um ? ' checked' : ''}>max</label>` +
        `</div>`;
      }).join('') + `</div>`;
  });
  h += `<div class="aldea">` + (cuerpo || `<div class="hint">esta aldea no tiene cuartel, establo ni taller (o falta escanear)</div>`) + `</div>`;
  return h;
}

/* ═══════════ CONSTRUCCIÓN ═══════════ */

function cfgAldea(c, did) {
  const base = { campos: { on: true, nivelMax: 10, tipos: [1, 2, 3, 4] }, edificios: [], herreria: [], npc: { on: false, umbral: 95 }, oro: { terminar: false } };
  const todas = c.aldeas;
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
const cuentaConstr = (c, did) => { const a = cfgAldea(c, did); return (a.campos.on ? 1 : 0) + a.edificios.length + a.herreria.length + (a.npc.on ? 1 : 0) + (a.oro.terminar ? 1 : 0); };

function cuerpoConstruccion(cfg, aldeas, edificios, herreria) {
  const c = cfg.recursos;
  const cada = c.cada || [180, 300];
  const cab =
    `<label>revisar cada <input type="number" min="10" data-cfg="recursos.cada.0" value="${cada[0]}" style="width:52px"> a ` +
    `<input type="number" min="10" data-cfg="recursos.cada.1" value="${cada[1]}" style="width:52px"> s</label>` +
    (aldeas.length > 1 ? `<label class="chk"><input type="checkbox" data-cfg="recursos.unaPorVuelta"${c.unaPorVuelta !== false ? ' checked' : ''}> una aldea por vuelta (va rotando, abre pocas páginas)</label>` : '');
  if (!aldeas.length) return cab + `<div class="hint">Escaneá las aldeas (tarjeta Tropas) para configurar esto.</div>`;

  const aldea = aldeaVisible('aldeaConstr', aldeas);
  const did = String(aldea.did);
  const A = cfgAldea(c, did);
  const slots = (edificios[did] || []).filter(s => s.gid > 4);
  const herr = herreria[did] || [];

  let h = cab + `<div class="fila"><span class="hint">ver aldea</span>` +
    desplegableAldeas(aldeas.map(a => ({ did: a.did, nombre: conTribu(a) + (cuentaConstr(c, String(a.did)) ? ' ●' : '') })), did, 'veraldeac') +
    `</div><div class="aldea">`;

  // campos
  h += `<div class="edif"><div class="edifn">campos de recursos</div>` +
    `<div class="u"><label class="chk"><input type="checkbox" id="c_on"${A.campos.on ? ' checked' : ''}> subir campos en esta aldea</label>` +
    `<span class="hint">hasta nv</span><input type="number" min="1" max="21" id="c_max" value="${A.campos.nivelMax}" style="width:44px"></div>` +
    `<div class="u">` + [1, 2, 3, 4].map(g => `<label class="chk"><input type="checkbox" data-ctipo="${g}"${A.campos.tipos.indexOf(g) >= 0 ? ' checked' : ''}>${RECURSO[g]}</label>`).join('') + `</div></div>`;

  // edificios existentes
  const elegidos = {};
  A.edificios.forEach(e => { elegidos[num(e.gid)] = e; });
  h += `<div class="edif"><div class="edifn">edificios</div>`;
  if (!slots.length) h += `<div class="hint">sin datos de esta aldea: volvé a escanear</div>`;
  slots.filter(s => s.gid).forEach(s => {
    const e = elegidos[s.gid];
    const nom = s.nombre ? s.nombre + (GIDS_TODOS[s.gid] && GIDS_TODOS[s.gid].toLowerCase() !== s.nombre.toLowerCase() ? ' (' + GIDS_TODOS[s.gid] + ')' : '') : (GIDS_TODOS[s.gid] || 'gid' + s.gid);
    h += `<div class="u"><label class="chk"><input type="checkbox" data-ed="${s.gid}"${e ? ' checked' : ''}>${esc(nom)}</label>` +
      `<span class="hint">nv ${s.nivel} → hasta</span><input type="number" min="1" max="20" data-edmax="${s.gid}" value="${e ? e.nivelMax : Math.min(20, s.nivel + 1)}" style="width:44px"></div>`;
  });
  // elegidos que todavía no existen (construir nuevo)
  A.edificios.filter(e => !slots.some(s => s.gid === num(e.gid))).forEach(e => {
    const g = num(e.gid);
    h += `<div class="u"><label class="chk"><input type="checkbox" data-ed="${g}" checked>${esc(GIDS_TODOS[g] || 'gid' + g)} <span class="hint">(nuevo)</span></label>` +
      `<span class="hint">hasta</span><input type="number" min="1" max="20" data-edmax="${g}" value="${e.nivelMax}" style="width:44px"></div>`;
  });
  const faltan = Object.keys(GIDS_TODOS).map(Number).filter(g => !slots.some(s => s.gid === g) && !elegidos[g]);
  h += `<div class="u"><span class="hint">construir nuevo:</span><select id="nuevo_gid" style="flex:1">` +
    faltan.map(g => `<option value="${g}">${esc(GIDS_TODOS[g])}</option>`).join('') +
    `</select><input type="number" min="1" max="20" id="nuevo_max" value="1" title="hasta nivel" style="width:44px"><button class="mini" id="nuevo_add">+</button></div>` +
    `<div class="hint">Construir desde cero no lo pude verificar en tu servidor: si falla, el log lo dice.</div></div>`;

  // herrería
  h += `<div class="edif"><div class="edifn">herrería</div>`;
  if (!herr.length) h += `<div class="hint">${slots.some(s => s.gid === 13) ? 'sin datos: volvé a escanear' : 'esta aldea no tiene herrería'}</div>`;
  herr.forEach(x => {
    const e = A.herreria.find(y => num(y.u) === x.u);
    h += `<div class="u"><label class="chk"><input type="checkbox" data-h="${x.u}"${e ? ' checked' : ''}>${esc(x.nombre)}</label>` +
      `<span class="hint">nv ${x.nivel} → hasta</span><input type="number" min="1" max="20" data-hmax="${x.u}" value="${e ? e.nivelMax : Math.min(20, x.nivel + 1)}" style="width:44px"></div>`;
  });
  h += `</div>`;

  // oro
  h += `<div class="edif oro"><div class="edifn">⚠ cuesta oro</div>` +
    `<div class="u"><label class="chk"><input type="checkbox" id="oro_on"${A.oro.terminar ? ' checked' : ''}> terminar las construcciones con oro (cada vuelta)</label></div>` +
    `<div class="u"><label class="chk"><input type="checkbox" id="npc_on"${A.npc.on ? ' checked' : ''}> NPC cuando un depósito pase del</label>` +
    `<input type="number" min="50" max="100" id="npc_umbral" value="${A.npc.umbral}" style="width:44px"><span class="hint">%</span></div>` +
    `<div class="hint">NPC = 3 oro por vez. Reparte los 4 recursos en partes iguales (el cereal, hasta el 90 % del granero).</div></div>`;

  return h + `</div>`;
}

/* ═══════════ el resto de las tarjetas ═══════════ */

function cuerpoRol(rol, cfg, aldeas, unidades, scan, edificios, herreria) {
  const c = cfg[rol];
  if (rol === 'tropas')   return cuerpoTropas(cfg, aldeas, unidades, scan);
  if (rol === 'recursos') return cuerpoConstruccion(cfg, aldeas, edificios, herreria);

  const intervalo = `<label>cada <input type="number" min="5" data-cfg="${rol}.cadaSeg" value="${c.cadaSeg}" style="width:56px"> segundos (fijo)</label>`;

  if (rol === 'farm') {
    const v = (c.listas === 'todas') ? '' : (Array.isArray(c.listas) ? c.listas.join(', ') : '');
    return intervalo +
      `<label>listas <input type="text" id="farmlistas" value="${esc(v)}" placeholder="vacío = todas"></label>` +
      (aldeas.length ? `<div class="fila"><span class="hint">enviar desde</span>` +
        desplegableAldeas(aldeas.map(a => ({ did: a.did, nombre: conTribu(a) })), c.did || 'ACTIVA', 'faldea',
          `<option value="ACTIVA"${!c.did ? ' selected' : ''}>la aldea activa (sin cambiar)</option>`) + `</div>` : '') +
      `<div class="hint">En tu versión no hay "Start all": se mandan una por una y las vacías se saltean. Las listas son de la cuenta, así que la aldea sólo importa si alguna no aparece.</div>`;
  }

  // héroe
  return intervalo +
    `<label>salud mínima <input type="number" min="0" max="100" data-cfg="heroe.saludMin" value="${c.saludMin}" style="width:52px">%</label>` +
    `<label>elegir <select data-cfg="heroe.elegir">` +
      ['corta', 'larga', 'primera'].map(o => `<option value="${o}"${c.elegir === o ? ' selected' : ''}>${o}</option>`).join('') +
    `</select></label>` +
    `<label class="chk"><input type="checkbox" data-cfg="heroe.exigirSalud"${c.exigirSalud ? ' checked' : ''}> no mandarlo si no puedo leer la salud</label>` +
    `<div class="hint">La salud se lee en /hero/attributes y se guarda 90 s; cada vuelta son 2 páginas.</div>`;
}

/* ═══════════ render ═══════════ */

function estructura() {
  const { cfg, aldeas, unidades, scan, edificios, herreria } = ESTADO;
  document.getElementById('cards').innerHTML = ROLES.map(rol => `
    <div class="card" data-rol="${rol}">
      <div class="card-h">
        <input type="checkbox" data-on="${rol}"${cfg[rol].on ? ' checked' : ''}>
        <b>${NOMBRE[rol]}</b>
        <i class="dot"></i>
        <span class="est">—</span>
        <button class="mini" data-ya="${rol}">ahora</button>
        <button class="mini" data-abrir="${rol}">pestaña</button>
      </div>
      <div class="card-b">${cuerpoRol(rol, cfg, aldeas, unidades, scan, edificios, herreria)}</div>
    </div>`).join('');
  const cp = document.querySelector('[data-cfg="cerrarAlParar"]');
  if (cp) cp.checked = !!cfg.cerrarAlParar;
  const md = document.getElementById('modo');
  if (md) md.value = cfg.modo || 'todo';
  enganchar();
}

function pintarEstado() {
  const { run, est, log, alarma, origen, lock } = ESTADO;
  const r = document.getElementById('run');
  r.textContent = run ? 'CORRIENDO' : 'DETENIDO';
  r.className = 'run' + (run ? ' on' : '');
  const b = document.getElementById('toggle');
  b.textContent = run ? '■ PARAR' : '▶ ARRANCAR';
  b.className = 'big' + (run ? ' rojo' : '');
  document.getElementById('origen').textContent = (origen ? 'servidor: ' + origen.replace(/^https?:\/\//, '') : 'abrí tu Travian antes de darle play') +
    (lock && lock.rol ? '  ·  aldea tomada por ' + (NOMBRE[lock.rol] || lock.rol) : '');

  const al = document.getElementById('alarma');
  al.style.display = alarma ? 'block' : 'none';
  if (alarma) {
    al.innerHTML = `⛔ ${esc(alarma.m)} (${hhmm(alarma.t)}) <button id="okalarma">ok</button>`;
    document.getElementById('okalarma').onclick = async () => { await bg({ tipo: 'limpiarAlarma' }); refrescar(true); };
  }
  ROLES.forEach(rol => {
    const card = document.querySelector(`.card[data-rol="${rol}"]`);
    if (!card) return;
    const e = est[rol] || {};
    const dot = card.querySelector('.dot');
    dot.className = 'dot' + (e.viva ? ' ok' : '');
    dot.title = e.viva ? 'pestaña abierta' : 'pestaña cerrada';
  });
  tictac();
  document.getElementById('log').innerHTML = log.slice(-40).reverse()
    .map(x => `<div><span>${hhmm(x.t)}</span> <em>${esc(x.r)}</em> ${esc(x.m)}</div>`).join('');
}

/* ═══════════ eventos ═══════════ */

async function guardar(cfg) {
  ESTADO.cfg = cfg;
  await bg({ tipo: 'guardarCfg', cfg });
}

function enganchar() {
  document.querySelectorAll('[data-on]').forEach(ch => ch.onchange = async () => {
    const cfg = ESTADO.cfg; cfg[ch.dataset.on].on = ch.checked; await guardar(cfg);
  });

  document.querySelectorAll('[data-cfg]').forEach(el => el.onchange = async () => {
    const cfg = ESTADO.cfg;
    const ruta = el.dataset.cfg.split('.');
    let o = cfg;
    for (let i = 0; i < ruta.length - 1; i++) o = o[ruta[i]];
    const k = ruta[ruta.length - 1];
    o[k] = (el.type === 'checkbox') ? el.checked : (el.type === 'number' ? num(el.value) : el.value);
    if (Array.isArray(o) && o.length === 2) { o[0] = Math.max(5, o[0] || 5); o[1] = Math.max(o[0], o[1] || o[0]); }
    await guardar(cfg);
  });

  const fl = document.getElementById('farmlistas');
  if (fl) fl.onchange = async () => {
    const cfg = ESTADO.cfg;
    const v = fl.value.trim();
    cfg.farm.listas = v ? v.split(',').map(s => s.trim()).filter(Boolean) : 'todas';
    await guardar(cfg);
  };
  const fa = document.getElementById('faldea');
  if (fa) fa.onchange = async () => { const cfg = ESTADO.cfg; cfg.farm.did = (fa.value === 'ACTIVA') ? '' : fa.value; await guardar(cfg); };

  const esc_ = document.getElementById('escanear');
  if (esc_) esc_.onclick = async () => { esc_.disabled = true; await bg({ tipo: 'escanear', origen: await origenActivo() }); refrescar(true); };

  /* — tropas — */
  const ta = document.getElementById('todasaldeas');
  if (ta) ta.onchange = async () => {
    const cfg = ESTADO.cfg;
    cfg.tropas.aldeas = ta.checked ? 'todas' : (ESTADO.aldeas || []).map(a => String(a.did));
    await guardar(cfg); refrescar(true);
  };
  document.querySelectorAll('[data-aldea]').forEach(ch => ch.onchange = async () => {
    const cfg = ESTADO.cfg;
    if (!Array.isArray(cfg.tropas.aldeas)) cfg.tropas.aldeas = (ESTADO.aldeas || []).map(a => String(a.did));
    const did = ch.dataset.aldea;
    const i = cfg.tropas.aldeas.indexOf(did);
    if (ch.checked && i < 0) cfg.tropas.aldeas.push(did);
    if (!ch.checked && i >= 0) cfg.tropas.aldeas.splice(i, 1);
    await guardar(cfg);
  });
  const va = document.getElementById('veraldea');
  if (va) va.onchange = () => { ui.set('aldeaTropas', va.value); refrescar(true); };

  /* plan de tropas: en pantalla hay UNA aldea → se reemplaza sólo esa */
  const guardarPlan = async () => {
    const cfg = ESTADO.cfg;
    const defCada = cfg.tropas.cada || [60, 90];
    const plan = JSON.parse(JSON.stringify(cfg.tropas.plan || {}));
    const dids = new Set();
    document.querySelectorAll('[data-u]').forEach(ch => dids.add(ch.dataset.u.split('|')[0]));
    dids.forEach(d => { delete plan[d]; });
    document.querySelectorAll('[data-u]').forEach(ch => {
      if (!ch.checked) return;
      const [did, gid, t] = ch.dataset.u.split('|');
      const bk = did + '|' + gid;
      const g = a => document.querySelector(`[${a}="${ch.dataset.u}"]`);
      const b = a => document.querySelector(`[${a}="${bk}"]`);
      plan[did] = plan[did] || {};
      if (!plan[did][gid]) {
        const lo = Math.max(5, num(b('data-bmin') && b('data-bmin').value) || defCada[0]);
        const hi = Math.max(lo, num(b('data-bmax') && b('data-bmax').value) || defCada[1]);
        plan[did][gid] = { cada: [lo, hi], u: [] };
      }
      const usarMax = !!(g('data-umaxchk') && g('data-umaxchk').checked);
      const lo = Math.max(1, num(g('data-umin') && g('data-umin').value) || 1);
      const hi = Math.max(lo, num(g('data-umax') && g('data-umax').value) || lo);
      plan[did][gid].u.push({ t: parseInt(t, 10), min: lo, max: hi, usarMax });
    });
    cfg.tropas.plan = plan;
    await guardar(cfg);
  };
  document.querySelectorAll('[data-u],[data-umin],[data-umax],[data-umaxchk],[data-bmin],[data-bmax]').forEach(el => el.onchange = guardarPlan);

  /* — construcción — */
  const vc = document.getElementById('veraldeac');
  if (vc) vc.onchange = () => { ui.set('aldeaConstr', vc.value); refrescar(true); };

  const guardarConstr = async () => {
    const cfg = ESTADO.cfg;
    const aldeas = ESTADO.aldeas || [];
    if (!aldeas.length) return;
    const did = String(aldeaVisible('aldeaConstr', aldeas).did);
    if (!cfg.recursos.aldeas || typeof cfg.recursos.aldeas !== 'object' || Array.isArray(cfg.recursos.aldeas)) cfg.recursos.aldeas = {};
    const g = id => document.getElementById(id);
    cfg.recursos.aldeas[did] = {
      campos: {
        on: !!(g('c_on') && g('c_on').checked),
        nivelMax: Math.max(1, num(g('c_max') && g('c_max').value) || 10),
        tipos: [...document.querySelectorAll('[data-ctipo]')].filter(x => x.checked).map(x => num(x.dataset.ctipo)),
      },
      edificios: [...document.querySelectorAll('[data-ed]')].filter(x => x.checked).map(x => {
        const m = document.querySelector(`[data-edmax="${x.dataset.ed}"]`);
        return { gid: num(x.dataset.ed), nivelMax: Math.max(1, num(m && m.value) || 1) };
      }),
      herreria: [...document.querySelectorAll('[data-h]')].filter(x => x.checked).map(x => {
        const m = document.querySelector(`[data-hmax="${x.dataset.h}"]`);
        return { u: num(x.dataset.h), nivelMax: Math.max(1, num(m && m.value) || 1) };
      }),
      npc: { on: !!(g('npc_on') && g('npc_on').checked), umbral: Math.min(100, Math.max(50, num(g('npc_umbral') && g('npc_umbral').value) || 95)) },
      oro: { terminar: !!(g('oro_on') && g('oro_on').checked) },
    };
    await guardar(cfg);
  };
  document.querySelectorAll('#c_on,#c_max,[data-ctipo],[data-ed],[data-edmax],[data-h],[data-hmax],#npc_on,#npc_umbral,#oro_on')
    .forEach(el => el.onchange = guardarConstr);

  const add = document.getElementById('nuevo_add');
  if (add) add.onclick = async () => {
    await guardarConstr();
    const cfg = ESTADO.cfg;
    const did = String(aldeaVisible('aldeaConstr', ESTADO.aldeas || []).did);
    const gid = num(document.getElementById('nuevo_gid').value);
    const max = Math.max(1, num(document.getElementById('nuevo_max').value) || 1);
    if (!gid) return;
    const A = cfg.recursos.aldeas[did];
    if (!A.edificios.some(e => num(e.gid) === gid)) A.edificios.push({ gid, nivelMax: max });
    await guardar(cfg);
    refrescar(true);
  };

  document.querySelectorAll('[data-ya]').forEach(b => b.onclick = async () => { await bg({ tipo: 'forzar', rol: b.dataset.ya }); refrescar(); });
  document.querySelectorAll('[data-abrir]').forEach(b => b.onclick = async () => { await bg({ tipo: 'abrir', rol: b.dataset.abrir, origen: await origenActivo() }); refrescar(); });
}

document.getElementById('toggle').onclick = async () => {
  if (ESTADO.run) await bg({ tipo: 'parar' });
  else {
    const origen = await origenActivo() || ESTADO.origen;
    if (!origen) { alert('Abrí primero una pestaña de tu Travian (con la sesión iniciada) y volvé a darle play desde ahí.'); return; }
    await bg({ tipo: 'arrancar', origen });
  }
  refrescar(true);
};

document.getElementById('diag').onclick = async () => {
  const d = ESTADO.diag;
  if (!d) { alert('Todavía no hay diagnóstico: se guarda cuando algo falla.'); return; }
  const t = JSON.stringify({ que: d.que, url: d.url, gid: d.gid, did: d.did, aldea: d.aldea, conteos: d.conteos, botones: d.botones,
                             aldeas: ESTADO.aldeas, edificios: ESTADO.edificios, herreria: ESTADO.herreria, unidades: ESTADO.unidades, html: d.html }, null, 1);
  try {
    await navigator.clipboard.writeText(t);
    document.getElementById('diag').textContent = '¡copiado! pegámelo';
    setTimeout(() => { document.getElementById('diag').textContent = 'copiar diagnóstico'; }, 2500);
  } catch (e) { alert('No pude copiar al portapapeles.'); }
};
document.getElementById('limpiarlog').onclick = async () => { await bg({ tipo: 'limpiarLog' }); refrescar(true); };

/* ═══════════ el reloj ═══════════
   Aparte del refresco de estado: si se dibujara con cada respuesta del
   service worker (1 Hz + demora) el segundero saltearía números. */
function tictac() {
  if (!ESTADO || !ESTADO.est) return;
  const T = Date.now();
  ROLES.forEach(rol => {
    const card = document.querySelector(`.card[data-rol="${rol}"]`);
    if (!card) return;
    const e = ESTADO.est[rol] || {};
    const falta = e.next > T ? Math.ceil((e.next - T) / 1000) : 0;
    const nuevo = ((e.st && e.st.txt) || '—') + (falta ? ' · ' + falta + 's' : '');
    const el = card.querySelector('.est');
    if (el.textContent !== nuevo) el.textContent = nuevo;
  });
}

/* ═══════════ ciclo ═══════════ */
async function refrescar(forzar) {
  const st = await bg({ tipo: 'estadoGeneral' });
  if (!st || !st.cfg) return;
  ESTADO = st;
  const foco = document.activeElement;
  const escribiendo = foco && /INPUT|SELECT/.test(foco.tagName);
  const firma = JSON.stringify([st.cfg, st.unidades, st.aldeas, st.scan, st.edificios, st.herreria]);
  if (forzar || (!escribiendo && firma !== firmaEstructura)) { firmaEstructura = firma; estructura(); }
  pintarEstado();
}
refrescar(true);
setInterval(() => refrescar(false), 1000);
setInterval(tictac, 250);
