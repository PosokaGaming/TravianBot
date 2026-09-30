// ==UserScript==
// @name         TravianBot
// @namespace    https://github.com/PosokaGaming/TravianBot
// @version      5.4.0
// @description  Bot para Travian Legends: TO DO LIST por aldea, farm list, tropas por prioridad de cola, héroe y construcción, con modos. Una sola pestaña.
// @author       TravianBot
// @match        *://*.travian.com/*
// @match        *://*.travian.net/*
// @match        *://*.travian.de/*
// @match        *://*.travian.com.br/*
// @match        *://*.travian.ru/*
// @match        *://*.travian.es/*
// @match        *://*.travian.it/*
// @match        *://*.travian.fr/*
// @match        *://*.travian.pl/*
// @match        *://*.travian.pt/*
// @match        *://*.travian.com.tr/*
// @match        *://*.travian.cz/*
// @match        *://*.travian.hu/*
// @match        *://*.travian.ro/*
// @match        *://*.travian.gr/*
// @match        *://*.travian.nl/*
// @match        *://*.travian.se/*
// @match        *://*.travian.dk/*
// @match        *://*.travian.fi/*
// @match        *://*.travian.no/*
// @match        *://*.travian.ae/*
// @match        *://*.travian.asia/*
// @match        *://*.travian.co.id/*
// @match        *://*.travian.co.kr/*
// @match        *://*.travian.jp/*
// @match        *://*.travian.cn/*
// @match        *://*.travian.in/*
// @match        *://*.travian.ir/*
// @match        *://*.travian.us/*
// @match        *://*.travian.co.uk/*
// @match        *://*.travian.ua/*
// @match        *://*.travian.sk/*
// @match        *://*.travian.si/*
// @match        *://*.travian.hr/*
// @match        *://*.travian.rs/*
// @match        *://*.travian.bg/*
// @match        *://*.travian.lt/*
// @match        *://*.travian.lv/*
// @match        *://*.travian.ee/*
// @match        *://*.travian.org/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @run-at       document-end
// @noframes
// @updateURL    https://raw.githubusercontent.com/PosokaGaming/TravianBot/main/TravianBot.user.js
// @downloadURL  https://raw.githubusercontent.com/PosokaGaming/TravianBot/main/TravianBot.user.js
// @homepageURL  https://github.com/PosokaGaming/TravianBot
// @supportURL   https://github.com/PosokaGaming/TravianBot/issues
// ==/UserScript==

/* Archivo GENERADO por tools/build_userscript.py — no editar a mano: los
   cambios van en extension/ (content.js, panel.*) o en src/userscript/. */
(function () {
'use strict';
const TB_CSS = "* { box-sizing: border-box; }\n\n.tbp {\n  margin: 0;\n  width: 420px;\n  max-height: 580px;\n  overflow-y: auto;\n  background: #1f1f22;\n  color: #e6e6e6;\n  font: 12px/1.45 system-ui, \"Segoe UI\", sans-serif;\n}\n\n.head {\n  display: flex; align-items: center; gap: 8px;\n  padding: 10px 12px; border-bottom: 1px solid #3a3a40;\n  position: sticky; top: 0; background: #1f1f22; z-index: 2;\n}\n.head b { font-size: 13px; }\n.run { font-size: 10px; padding: 2px 8px; border-radius: 99px; background: #5b5b5b; margin-left: auto; }\n.run.on { background: #2e7d32; color: #fff; }\n\n.alarma { display: none; background: #5b1b1b; color: #ffd9d9; padding: 8px 12px; font-size: 11px; }\n.alarma button { margin-left: 6px; background: #7a2a2a; border: 0; color: #ffd9d9; border-radius: 5px; padding: 2px 8px; cursor: pointer; }\n\n.acciones { display: flex; flex-direction: column; gap: 7px; padding: 10px 12px; border-bottom: 1px solid #3a3a40; }\n.big { padding: 10px; border: 0; border-radius: 7px; font-weight: 700; cursor: pointer; color: #fff; font-size: 13px; background: #2e7d32; }\n.big.rojo { background: #b53232; }\n.origen { font-size: 10px; color: #8a8a93; }\n\n.card { border-bottom: 1px solid #2e2e33; }\n.card-h { display: flex; align-items: center; gap: 6px; padding: 8px 12px; background: #26262b; }\n.card-b { padding: 8px 12px; display: flex; flex-direction: column; gap: 7px; }\n.est { margin-left: auto; color: #9bd; font-size: 11px; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; background: #8a3b3b; flex: none; }\n.dot.ok { background: #4caf50; }\n.mini { background: #3a3a42; border: 0; color: #ddd; border-radius: 5px; padding: 3px 7px; cursor: pointer; font-size: 10px; }\n\nlabel { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #c9c9cf; }\n.chk { gap: 6px; }\ninput[type=text], input[type=number], select {\n  background: #141416; border: 1px solid #44444c; color: #eee;\n  border-radius: 5px; padding: 3px 5px; font-size: 11px;\n}\ninput[type=text] { flex: 1; min-width: 60px; }\n\n.gids { display: flex; flex-direction: column; gap: 8px; margin-top: 2px; }\n.gid { background: #232328; border: 1px solid #33333a; border-radius: 6px; padding: 6px 8px; }\n.u { display: flex; align-items: center; gap: 6px; margin: 3px 0 0 14px; }\n.u label { flex: 1; }\n.hint { color: #8a8a93; font-size: 10px; }\n\n.logwrap { border-top: 1px solid #3a3a40; max-height: 160px; overflow: auto; background: #161618; }\n#log div { padding: 2px 12px; font: 11px/1.4 ui-monospace, Consolas, monospace; border-bottom: 1px solid #202024; }\n#log span { color: #666; }\n#log em { color: #7fa; font-style: normal; }\n\n/* aldeas y edificios */\n.fila { display: flex; align-items: center; gap: 8px; }\n.escanear { background: #2f4f7a; }\n.aldea { background: #232328; border: 1px solid #33333a; border-radius: 6px; padding: 6px 8px; }\n.aldean { margin-bottom: 4px; }\n.edif { margin: 4px 0 4px 12px; }\n.edifn { color: #9a9aa4; font-size: 10px; text-transform: uppercase; letter-spacing: .04em; }\n.u { display: flex; align-items: center; gap: 5px; margin: 3px 0 0 10px; }\n.u label { flex: 1; min-width: 0; }\n.u label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.pie { display: flex; gap: 8px; padding: 8px 12px; border-top: 1px solid #3a3a40; }\n.edifh { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }\n.edifh .edifn { flex: none; margin-right: 4px; }\n.edif.oro { border-left: 3px solid #b58a2a; padding-left: 8px; }\n.edif.oro .edifn { color: #d9a441; }\n\n.modo{margin:8px 0 2px;font-weight:700;display:flex;flex-wrap:wrap;align-items:center;gap:6px}\n.modo select{font-weight:700;padding:2px 6px}\n.modo small{font-weight:400;opacity:.7;width:100%}\n\n/* TO DO LIST */\ntextarea { width: 100%; background: #141416; border: 1px solid #44444c; color: #eee; border-radius: 5px;\n           padding: 5px 6px; font: 11px/1.45 ui-monospace, Consolas, monospace; resize: vertical; }\ndetails summary { cursor: pointer; }\n.ayuda { margin-top: 4px; line-height: 1.6; }\n.lrow { padding: 3px 0; border-bottom: 1px solid #2c2c32; }\n.lrow:last-child { border-bottom: 0; }\n.lrow b { color: #e6e6e6; margin-right: 4px; }\n.lord { color: #b9c4d6; font-size: 11px; }\n.lest { color: #8fc79a; font-size: 10px; margin-top: 1px; }\n.lerr { color: #ff9b8f; font-size: 11px; margin-top: 3px; }\n\n.tbp{width:420px;max-height:80vh;overflow-y:auto;border:1px solid #3a3a40;border-radius:8px;box-shadow:0 8px 28px rgba(0,0,0,.55)}\n[data-abrir],.acciones .chk{display:none}\n.cerrar{margin-left:6px}\n";
const TB_HTML = "<div class=\"head\">\n    <b>Travian Bot</b>\n    <span class=\"run\" id=\"run\">…</span>\n  </div>\n\n  <div class=\"alarma\" id=\"alarma\"></div>\n\n  <div class=\"acciones\">\n    <button class=\"big\" id=\"toggle\">…</button>\n    <div class=\"origen\" id=\"origen\"></div>\n    <div class=\"modo\">MODO\n      <select data-cfg=\"modo\" id=\"modo\">\n        <option value=\"lista\">TO DO LIST</option>\n        <option value=\"tropas\">TROPAS</option>\n        <option value=\"farm\">FARM</option>\n        <option value=\"construccion\">CONSTRUCCIÓN</option>\n        <option value=\"todo\">TODO a la vez</option>\n      </select>\n      <small>el modo elegido usa las pestañas; farm list y héroe siguen de fondo si están tildados</small>\n    </div>\n    <label class=\"chk\"><input type=\"checkbox\" data-cfg=\"cerrarAlParar\"> cerrar las pestañas al parar</label>\n  </div>\n\n  <div id=\"cards\"></div>\n\n  <div class=\"pie\">\n    <button class=\"mini\" id=\"diag\">copiar diagnóstico</button>\n    <button class=\"mini\" id=\"limpiarlog\">limpiar log</button>\n  </div>\n\n  <div class=\"logwrap\"><div id=\"log\"></div></div>";
/*  Travian Bot · TO DO LIST
 *
 *  Pedido del usuario el 29/09/2026: darle al bot una lista por aldea y que
 *  cada aldea haga SÓLO eso (la farm list sigue de fondo). Este archivo
 *  convierte el texto de la lista en órdenes por aldea. Lo usan el panel (para
 *  mostrar cómo se entendió cada línea), el content script (para trabajar) y
 *  el service worker. Funciones puras: nada de DOM ni de chrome.*.
 *
 *  Formato (una línea por aldea; # = comentario):
 *    04T: Warehouse 20, Tournament Square 17, hospital, tropas Clubswinger + Teutonic Knight
 *    010: campos 10, tropas Clubswinger + Teutonic Knight
 *    07: tropas Marauder/Steppe Rider      ← "A/B": A, y si no está investigada, B
 *    01: !Tournament Square 10, tropas …   ← "!" = PRIORIDAD (va antes que las tropas)
 *    todas: fiestas
 *  Una línea sin "ALDEA:" sigue con la aldea de la línea anterior.
 */
var TB_LISTA = (function () {
  'use strict';

  const norm = s => String(s == null ? '' : s).toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/['’`´]/g, '').replace(/[^\p{L}\p{N}/+\s]/gu, ' ').replace(/\s+/g, ' ').trim();
  // plural simple: "marauders" = "marauder", "campos" = "campo"
  const sing = s => s.split(' ').map(w => w.length > 3 ? w.replace(/(es|s)$/, '') : w).join(' ');

  /* ── edificios: gid → nombres (inglés del servidor internacional + castellano) ── */
  const NOMBRE_ES = {
    1: 'Leñador', 2: 'Barrera', 3: 'Mina de hierro', 4: 'Granja',
    5: 'Aserradero', 6: 'Fábrica de ladrillos', 7: 'Fundición', 8: 'Molino', 9: 'Panadería',
    10: 'Almacén', 11: 'Granero', 13: 'Herrería', 14: 'Plaza de torneos', 15: 'Edificio principal',
    16: 'Plaza de reuniones', 17: 'Mercado', 18: 'Embajada', 19: 'Cuartel', 20: 'Establo', 21: 'Taller',
    22: 'Academia', 23: 'Escondite', 24: 'Ayuntamiento', 25: 'Residencia', 26: 'Palacio', 27: 'Tesoro',
    28: 'Oficina de comercio', 29: 'Gran cuartel', 30: 'Gran establo', 31: 'Muralla', 32: 'Terraplén',
    33: 'Empalizada', 34: 'Cantero', 35: 'Cervecería', 36: 'Trampero', 37: 'Mansión del héroe',
    38: 'Gran almacén', 39: 'Gran granero', 41: 'Abrevadero', 42: 'Muro de piedra', 43: 'Muro improvisado',
    44: 'Centro de mando', 45: 'Acueducto', 46: 'Hospital',
  };
  const ALIAS_EDIF = {
    5: ['sawmill', 'aserradero'], 6: ['brickyard', 'fabrica de ladrillos', 'ladrillar'],
    7: ['iron foundry', 'fundicion', 'fundicion de hierro'], 8: ['grain mill', 'molino'], 9: ['bakery', 'panaderia'],
    10: ['warehouse', 'almacen', 'deposito'], 11: ['granary', 'granero'], 13: ['smithy', 'armory', 'herreria'],
    14: ['tournament square', 'plaza de torneos', 'plaza de torneo', 'torneos', 'ts'],
    15: ['main building', 'edificio principal', 'principal', 'mb'],
    16: ['rally point', 'plaza de reuniones', 'punto de reunion', 'rp'], 17: ['marketplace', 'market', 'mercado'],
    18: ['embassy', 'embajada'], 19: ['barracks', 'cuartel'], 20: ['stable', 'establo'], 21: ['workshop', 'taller'],
    22: ['academy', 'academia'], 23: ['cranny', 'escondite'], 24: ['town hall', 'ayuntamiento'],
    25: ['residence', 'residencia'], 26: ['palace', 'palacio'], 27: ['treasury', 'tesoro', 'tesoreria'],
    28: ['trade office', 'oficina de comercio', 'compania comercial'], 29: ['great barracks', 'gran cuartel'],
    30: ['great stable', 'gran establo'], 34: ['stonemasons lodge', 'stonemason', 'cantero', 'canteria'],
    35: ['brewery', 'cerveceria'], 36: ['trapper', 'trampero'],
    37: ['heros mansion', 'hero mansion', 'mansion del heroe', 'mansion'],
    38: ['great warehouse', 'gran almacen'], 39: ['great granary', 'gran granero'],
    41: ['horse drinking trough', 'abrevadero'], 44: ['command center', 'centro de mando'],
    45: ['waterworks', 'acueducto'], 46: ['hospital'],
  };
  // murallas: cada tribu tiene la suya; se resuelve al muro que tenga la aldea (slot 40)
  const MURALLA = ['wall', 'city wall', 'earth wall', 'palisade', 'stone wall', 'makeshift wall', 'defensive wall',
                   'muralla', 'muro', 'terraplen', 'empalizada'];
  const GIDS_MURALLA = [31, 32, 33, 42, 43];
  const CAMPOS = {
    0: ['campos', 'campos de recursos', 'recursos', 'resources', 'resource fields', 'fields', 'res'],
    1: ['madera', 'lenador', 'woodcutter', 'wood', 'lumber'],
    2: ['barro', 'barrera', 'arcilla', 'clay', 'clay pit'],
    3: ['hierro', 'mina de hierro', 'mina', 'iron', 'iron mine'],
    4: ['cereal', 'granja', 'trigo', 'crop', 'cropland'],
  };

  /* ── tropas: alias en castellano → nombre del servidor (inglés). Una lista =
     alternativas (la primera que tenga la aldea). ── */
  const ALIAS_UNID = {
    // hunos
    'mercenario': ['mercenary'], 'arquero': ['bowman'], 'observador': ['spotter'],
    'jinete estepario': ['steppe rider'], 'estepario': ['steppe rider'], 'steppa': ['steppe rider'], 'steppe': ['steppe rider'],
    'tirador': ['marksman'], 'tirador montado': ['marksman'], 'merodeador': ['marauder'],
    // germanos
    'luchador de porra': ['clubswinger'], 'porra': ['clubswinger'], 'club': ['clubswinger'], 'clubs': ['clubswinger'],
    'lancero': ['spearman'], 'hachero': ['axeman'], 'hacha': ['axeman'], 'explorador': ['scout'],
    'caballero teuton': ['teutonic knight'], 'teuton': ['teutonic knight'], 'tk': ['teutonic knight'], 'tks': ['teutonic knight'],
    'jefe': ['chief'], 'cabecilla': ['chief'],
    // romanos
    'legionario': ['legionnaire'], 'pretoriano': ['praetorian'], 'imperano': ['imperian'], 'imperiano': ['imperian'],
    'legati': ['equites legati'], 'el': ['equites legati'], 'ei': ['equites imperatoris'], 'ec': ['equites caesaris'],
    'senador': ['senator'],
    // de todos
    'ariete': ['ram'], 'catapulta': ['catapult'], 'cata': ['catapult'], 'colono': ['settler'],
    // espías de cualquier tribu
    'scout': ['scout', 'spotter', 'pathfinder', 'equites legati', 'sopdu explorer', 'sentinel'],
    'espia': ['scout', 'spotter', 'pathfinder', 'equites legati', 'sopdu explorer', 'sentinel'],
    'espias': ['scout', 'spotter', 'pathfinder', 'equites legati', 'sopdu explorer', 'sentinel'],
  };

  const EDIF_IDX = (() => {
    const m = {};
    Object.keys(ALIAS_EDIF).forEach(g => ALIAS_EDIF[g].forEach(a => { m[sing(norm(a))] = +g; }));
    Object.keys(NOMBRE_ES).forEach(g => { const k = sing(norm(NOMBRE_ES[g])); if (!m[k] && +g > 4) m[k] = +g; });
    return m;
  })();
  const CAMPO_IDX = (() => {
    const m = {};
    Object.keys(CAMPOS).forEach(k => CAMPOS[k].forEach(a => { m[sing(norm(a))] = +k; }));
    return m;
  })();
  const MURO_IDX = new Set(MURALLA.map(a => sing(norm(a))));

  const PAL_TROPAS = /^(tropas?|troops?|train|training|entrenar|queue|encolar|cola|hacer|make)\s+/;
  const PAL_RELLENO = /^(subir|upgrade|finish|terminar|terminar de subir|build|construir|mejorar)\s+/;
  const RX_NIVEL = /^(.*?)\s*(?:\b(?:a|al|hasta|to|nv|nivel|lvl|level|lv)\b\s*)?(\d{1,2})$/;
  const RX_FIESTA = /^(fiestas?|parties|party|celebraciones?|celebrations?|keep parties going)\b(.*)$/;
  const RX_HOSP = /^(curar( el)? hospital|clear hospital|vaciar( el)? hospital|curar heridos|curar|heal|hospital)$/;

  /* PRIORIDAD (pedido del 30/09: "prioridad en 01 plaza de torneos hasta 10"):
     "!Tournament Square 10", "prioridad Tournament Square 10" o "… 10 primero".
     Sólo vale para obras: esa obra va antes que el establo y, mientras no
     esté cumplida, las tropas de la aldea dejan reservado el próximo nivel. */
  const RX_PRIO = /^(prioridad|priority|prio|primero|first|urgente|urgent)\b\s*/;
  const RX_PRIO_FIN = /\s*\b(prioridad|priority|prio|primero|first)$/;
  function orden(texto) {
    let crudo = String(texto == null ? '' : texto), prio = false;
    if (/^\s*!|!\s*$/.test(crudo)) { prio = true; crudo = crudo.replace(/!/g, ' '); }
    let t = norm(crudo);
    const mp = t.match(RX_PRIO) || t.match(RX_PRIO_FIN);
    if (mp) { prio = true; t = t.replace(mp[0], '').trim(); }
    const o = ordenSuelta(t, texto);
    if (o && prio && (o.tipo === 'edificio' || o.tipo === 'campos')) o.prio = true;
    return o;
  }

  /* una orden suelta (ya normalizada) → objeto, o { error } */
  function ordenSuelta(t, texto) {
    if (!t) return null;
    const f = t.match(RX_FIESTA);
    if (f) return { tipo: 'fiestas', grande: !/\b(chicas?|pequenas?|small)\b/.test(f[2]), txt: texto.trim() };
    if (RX_HOSP.test(t)) return { tipo: 'hospital', txt: texto.trim() };
    if (/^nada$|^nothing$/.test(t)) return { tipo: 'nada', txt: texto.trim() };

    const esTropa = PAL_TROPAS.test(t);
    if (!esTropa) {
      const tt = t.replace(PAL_RELLENO, '');
      const m = tt.match(RX_NIVEL);
      const nombre = sing(m ? m[1] : tt), nivel = m ? parseInt(m[2], 10) : 0;
      if (nombre in CAMPO_IDX) {
        const k = CAMPO_IDX[nombre];
        return { tipo: 'campos', tipos: k ? [k] : [1, 2, 3, 4], max: nivel || 99, txt: texto.trim() };
      }
      if (MURO_IDX.has(nombre)) {
        if (!nivel) return { error: 'falta el nivel en "' + texto.trim() + '"' };
        return { tipo: 'edificio', gid: 0, max: nivel, txt: texto.trim() };
      }
      if (nombre in EDIF_IDX) {
        if (!nivel) return { error: 'falta el nivel en "' + texto.trim() + '" (ej.: ' + texto.trim() + ' 20)' };
        return { tipo: 'edificio', gid: EDIF_IDX[nombre], max: nivel, txt: texto.trim() };
      }
      if (m) return { error: 'no conozco el edificio "' + m[1] + '"' };
    }
    // tropas: "A + B", "A y B"; alternativas "A/B", "A o B"
    const cuerpo = t.replace(PAL_TROPAS, '');
    const grupos = cuerpo.split(/\s*(?:\+|&|\by\b|\band\b)\s*/).map(g => g.trim()).filter(Boolean).map(g =>
      g.split(/\s*(?:\/|\bo\b|\bor\b)\s*/).map(x => x.trim()).filter(Boolean));
    if (!grupos.length) return { error: 'no entiendo "' + texto.trim() + '"' };
    return { tipo: 'tropas', grupos, txt: texto.trim() };
  }

  /* nombre escrito → aldeas. Exacto; si no, por número ("04" → "04T", "10" → "010") */
  function buscarAldea(tok, aldeas) {
    const t = norm(tok);
    if (!t) return [];
    if (/^(todas|todos|all|every)$/.test(t)) return aldeas.map(a => String(a.did));
    const ex = aldeas.filter(a => norm(a.nombre) === t);
    if (ex.length) return ex.map(a => String(a.did));
    if (/^\d+$/.test(t)) {
      const n = parseInt(t, 10);
      const porNum = aldeas.filter(a => { const m = norm(a.nombre).match(/^(\d+)/); return m && parseInt(m[1], 10) === n; });
      if (porNum.length === 1) return [String(porNum[0].did)];
    }
    const pre = aldeas.filter(a => norm(a.nombre).indexOf(t) === 0);
    return pre.length === 1 ? [String(pre[0].did)] : [];
  }

  /* texto completo → { porAldea: { did: { ordenes: [...] } }, errores: [{ linea, msg }] } */
  function parsear(texto, aldeas) {
    aldeas = aldeas || [];
    const porAldea = {}, errores = [];
    let actuales = [];
    String(texto || '').split(/\r?\n/).forEach((cruda, i) => {
      const linea = cruda.replace(/(#|\/\/).*$/, '').trim();
      if (!linea) return;
      let resto = linea;
      const dp = linea.indexOf(':');
      if (dp > 0) {
        const cab = linea.slice(0, dp).replace(/^[-–•*\s]+/, '');
        const dids = [], malas = [];
        const sumar = r => r.forEach(d => { if (dids.indexOf(d) < 0) dids.push(d); });
        // cada pedazo (separado por coma) primero entero: los nombres con espacios
        // ("Nueva aldea", "Capua 02") son lo normal en otros jugadores
        cab.split(/\s*[,;]\s*/).filter(Boolean).forEach(pieza => {
          const r = buscarAldea(pieza, aldeas);
          if (r.length) { sumar(r); return; }
          pieza.split(/\s+/).filter(Boolean).forEach(tok => {
            const r2 = buscarAldea(tok, aldeas);
            if (r2.length) sumar(r2); else malas.push(tok);
          });
        });
        if (malas.length) errores.push({ linea: i + 1, msg: 'no conozco la aldea "' + malas.join(', ') + '"' });
        actuales = dids;
        resto = linea.slice(dp + 1);
      } else if (!actuales.length) {
        errores.push({ linea: i + 1, msg: 'falta la aldea al principio ("04T: …")' });
        return;
      }
      resto.split(/\s*[,;]\s*/).forEach(pedazo => {
        const o = orden(pedazo);
        if (!o) return;
        if (o.error) { errores.push({ linea: i + 1, msg: o.error }); return; }
        actuales.forEach(did => {
          const a = porAldea[did] = porAldea[did] || { ordenes: [] };
          a.ordenes.push(o);
        });
      });
    });
    // "nada" gana: esa aldea queda quieta aunque "todas:" le haya dado algo
    Object.keys(porAldea).forEach(d => { if (porAldea[d].ordenes.some(o => o.tipo === 'nada')) porAldea[d].ordenes = []; });
    return { porAldea, errores };
  }

  const titulo = s => s.replace(/\b[a-z]/g, c => c.toUpperCase());
  /* cómo se entendió una orden (para el panel) */
  function describir(o) {
    return (o.prio ? '⚑ PRIORIDAD · ' : '') + describirBase(o);
  }
  function describirBase(o) {
    if (o.tipo === 'campos') {
      const que = o.tipos.length === 4 ? 'campos' : o.tipos.map(k => ({ 1: 'madera', 2: 'barro', 3: 'hierro', 4: 'cereal' }[k])).join('+');
      return que + (o.max >= 99 ? ' hasta el máximo' : ' → ' + o.max);
    }
    if (o.tipo === 'edificio') return (o.gid ? NOMBRE_ES[o.gid] : 'Muralla') + ' → ' + o.max;
    if (o.tipo === 'tropas') return 'tropas: ' + o.grupos.map(g => g.map(titulo).join(' / ')).join(' + ');
    if (o.tipo === 'hospital') return 'curar el hospital';
    if (o.tipo === 'fiestas') return o.grande ? 'fiesta grande (si no se puede, chica)' : 'fiestas chicas';
    return o.tipo;
  }

  /* ¿esta unidad de la aldea es la que pide la lista? */
  function coincide(pedida, nombreUnidad) {
    const u = sing(norm(nombreUnidad)), p = sing(norm(pedida));
    if (!u || !p) return false;
    if (u === p) return true;
    return p.length >= 4 && u.indexOf(p) === 0;   // "teutonic" → "teutonic knight"
  }
  const alternativas = nombre => {
    const n = norm(nombre);
    return ALIAS_UNID[n] || ALIAS_UNID[sing(n)] || [n];
  };
  /* de un grupo ("marauder/steppe rider"), la primera que esté en `filas` [{t, nombre}] */
  function elegirDelGrupo(grupo, filas) {
    for (const alt of grupo) for (const cand of alternativas(alt)) {
      const f = (filas || []).find(x => coincide(cand, x.nombre));
      if (f) return f;
    }
    return null;
  }

  /* órdenes de tropas + lo escaneado ({ 'did|gid': [{t, nombre}] }) → qué va a cada edificio.
     { porGid: { gid: [grupo, …] }, faltan: ['texto', …] } */
  const GIDS_TROPA = [19, 20, 21, 29, 30];
  function planTropas(ordenes, unidades, did) {
    const porGid = {}, faltan = [];
    (ordenes || []).filter(o => o.tipo === 'tropas').forEach(o => o.grupos.forEach(g => {
      let gidOk = 0;
      for (const gid of GIDS_TROPA) {
        if (elegirDelGrupo(g, unidades[did + '|' + gid])) { gidOk = gid; break; }
      }
      if (gidOk) (porGid[gidOk] = porGid[gidOk] || []).push(g);
      else faltan.push(g.join('/'));
    }));
    return { porGid, faltan };
  }

  return { parsear, describir, planTropas, elegirDelGrupo, coincide, norm, NOMBRE_ES, GIDS_MURALLA };
})();

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

/*  TravianBot · panel flotante del userscript
 *
 *  En la extensión el panel es el popup del ícono. Acá es un recuadro que se
 *  abre con el botón "TB" (abajo a la derecha) o desde el menú de
 *  Tampermonkey. Vive en un shadow DOM para que el CSS del juego no lo toque
 *  y el suyo no toque al juego. El código del panel es el MISMO panel.js de la
 *  extensión: se le pasa el shadow root como si fuera `document`.
 */
const TB_PANEL = (function () {
  'use strict';
  let host = null, root = null, abierto = false, iniciado = false;

  function crear() {
    if (host || !document.body) return;
    host = document.createElement('div');
    host.id = 'tb-panel-host';
    host.style.cssText = 'position:fixed;top:56px;right:12px;z-index:2147483001;display:none;';
    root = host.attachShadow({ mode: 'open' });
    root.innerHTML = '<style>' + TB_CSS + '</style><div class="tbp">' + TB_HTML + '</div>';
    document.body.appendChild(host);
    const x = document.createElement('button');
    x.className = 'mini cerrar'; x.textContent = '✕'; x.title = 'cerrar el panel';
    x.onclick = () => alternar(false);
    const head = root.querySelector('.head');
    if (head) head.appendChild(x);

    const b = document.createElement('div');
    b.id = 'tb-boton';
    b.textContent = 'TB';
    b.title = 'TravianBot';
    b.style.cssText = 'position:fixed;right:12px;bottom:12px;z-index:2147483001;width:40px;height:40px;border-radius:50%;' +
      'background:#2e7d32;color:#fff;font:700 13px/40px system-ui,sans-serif;text-align:center;cursor:pointer;' +
      'box-shadow:0 3px 10px rgba(0,0,0,.45);user-select:none;';
    b.onclick = () => alternar();
    document.body.appendChild(b);
  }

  function alternar(forzar) {
    crear();
    if (!host) return;
    abierto = forzar === undefined ? !abierto : !!forzar;
    host.style.display = abierto ? 'block' : 'none';
    if (abierto && !iniciado) { iniciado = true; panelMain(root, TB.bg); }
  }

  if (document.body) crear(); else document.addEventListener('DOMContentLoaded', crear);
  try { GM_registerMenuCommand('Abrir / cerrar el panel de TravianBot', () => alternar()); } catch (e) {}
  return { abierto: () => abierto, alternar };
})();

function panelMain(document, bg) {
/*  Travian Bot · panel (popup del ícono) v3
 *  No tiene lógica de juego: le pregunta todo al service worker y le manda
 *  órdenes. Por eso se puede cerrar y abrir sin afectar al bot.
 */

const ROLES  = ['lista', 'tropas', 'heroe', 'farm', 'recursos'];   // orden de las tarjetas
const NOMBRE = { tropas: 'Tropas', heroe: 'Héroe', farm: 'Farm list', recursos: 'Construcción', lista: 'TO DO LIST' };
const MILITARES = [19, 20, 21, 29, 30];
const GIDS   = { 19: 'Cuartel', 20: 'Establo', 21: 'Taller', 29: 'Gran cuartel', 30: 'Gran establo' };
const GIDS_TODOS = {
  5: 'Aserradero', 6: 'Fábrica de ladrillos', 7: 'Fundición', 8: 'Molino', 9: 'Panadería',
  10: 'Almacén', 11: 'Granero', 13: 'Herrería', 14: 'Plaza de torneos', 15: 'Edificio principal',
  16: 'Punto de reunión', 17: 'Mercado', 18: 'Embajada', 19: 'Cuartel', 20: 'Establo', 21: 'Taller',
  22: 'Academia', 23: 'Escondite', 24: 'Ayuntamiento', 25: 'Residencia', 26: 'Palacio', 27: 'Tesorería',
  28: 'Oficina de comercio', 29: 'Gran cuartel', 30: 'Gran establo', 31: 'Muralla', 32: 'Terraplén',
  33: 'Empalizada', 34: 'Cantero', 35: 'Cervecería', 36: 'Trampero', 37: 'Mansión del héroe',
  38: 'Gran almacén', 39: 'Gran granero', 41: 'Abrevadero', 42: 'Muro de piedra', 44: 'Centro de mando',
  45: 'Acueducto', 46: 'Hospital',
};
const RECURSO = { 1: 'madera', 2: 'barro', 3: 'hierro', 4: 'cereal' };
const TRIBU = { 1: 'Romano', 2: 'Teutón', 3: 'Galo', 4: 'Naturaleza', 5: 'Natar', 6: 'Egipcio', 7: 'Huno', 8: 'Espartano' };
const conTribu = a => a.nombre + (a.tribu ? ' · ' + (TRIBU[a.tribu] || 'tribu ' + a.tribu) : '');

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

async function origenActivo() { return location.origin; }

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

/* ═══════════ TO DO LIST ═══════════ */

function cuerpoLista(cfg, aldeas) {
  const c = cfg.lista || {};
  const cada = c.cada || [60, 90];
  const P = TB_LISTA.parsear(c.texto || '', aldeas || []);
  const conOrdenes = (aldeas || []).filter(a => P.porAldea[a.did]);
  let h =
    `<div class="hint">Una línea por aldea: <b>ALDEA: orden, orden…</b> Cada aldea hace <b>sólo</b> lo de la lista; la farm list sale igual. Se usa con el MODO <b>TO DO LIST</b>.</div>` +
    `<textarea id="listatexto" rows="12" spellcheck="false" placeholder="04T: Warehouse 20, Tournament Square 17, hospital, tropas Clubswinger + Teutonic Knight">${esc(c.texto || '')}</textarea>` +
    `<div class="fila"><button class="mini" id="listaguardar">guardar lista</button><span class="hint">(o Ctrl+Enter)</span></div>` +
    `<details><summary class="hint">órdenes que entiende</summary><div class="hint ayuda">` +
      `<b>campos 10</b> · campos hasta nv10 (sin número: hasta el máximo) · <b>madera / barro / hierro / cereal 10</b><br>` +
      `<b>Warehouse 20</b> · <b>Almacén 20</b> · un edificio (todas sus copias) hasta ese nivel<br>` +
      `<b>tropas Mercenary + Marksman</b> · entrenar sin parar · <b>Marauder/Steppe Rider</b> = la primera que esté investigada<br>` +
      `<b>hospital</b> · curar a los heridos · <b>fiestas</b> · grande si se puede, si no chica · <b>fiestas chicas</b><br>` +
      `<b>todas:</b> para todas las aldeas · <b>nada</b> · esa aldea quieta · <b>#</b> comentario` +
    `</div></details>` +
    `<label>caballos primero: el establo recibe los recursos hasta <input type="number" min="1" max="24" data-cfg="lista.caballosHoras" value="${c.caballosHoras || 2}" style="width:44px"> h de cola</label>` +
    `<label class="chk"><input type="checkbox" data-cfg="lista.heroe"${c.heroe !== false ? ' checked' : ''}> completar el establo con los recursos del héroe</label>` +
    `<label class="chk"><input type="checkbox" data-cfg="lista.npc"${c.npc !== false ? ' checked' : ''}> NPC con oro (3 oro) si con eso entra ≥1 h de tropas, una obra que tardaría ≥1 h, o para el rescate de cereal</label>` +
    `<label>máximo <input type="number" min="0" data-cfg="lista.npcMaxDia" value="${c.npcMaxDia == null ? 30 : c.npcMaxDia}" style="width:48px"> NPC por día` +
      `<span class="hint">hoy: ${(ESTADO.npc && ESTADO.npc.dia === new Date().toLocaleDateString('sv')) ? ESTADO.npc.n + (ESTADO.npc.sinOro ? ' · sin oro' : '') : 0}</span></label>` +
    `<label>revisar cada <input type="number" min="20" data-cfg="lista.cada.0" value="${cada[0]}" style="width:48px"> a ` +
    `<input type="number" min="20" data-cfg="lista.cada.1" value="${cada[1]}" style="width:48px"> s</label>`;
  h += `<div class="aldea">` +
    (conOrdenes.length
      ? conOrdenes.map(a => `<div class="lrow"><b>${esc(a.nombre)}</b> <span class="lord">${esc(P.porAldea[a.did].ordenes.map(TB_LISTA.describir).join(' · ') || 'nada')}</span>` +
                             `<div class="lest" data-lest="${a.did}"></div></div>`).join('')
      : `<div class="hint">la lista está vacía</div>`) +
    P.errores.map(e => `<div class="lerr">⚠ línea ${e.linea}: ${esc(e.msg)}</div>`).join('') +
    `</div>`;
  return h;
}

/* ═══════════ el resto de las tarjetas ═══════════ */

function cuerpoRol(rol, cfg, aldeas, unidades, scan, edificios, herreria) {
  const c = cfg[rol];
  if (rol === 'tropas')   return cuerpoTropas(cfg, aldeas, unidades, scan);
  if (rol === 'recursos') return cuerpoConstruccion(cfg, aldeas, edificios, herreria);
  if (rol === 'lista')    return cuerpoLista(cfg, aldeas);

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
  // qué está haciendo cada aldea de la lista (lo informa cada vuelta)
  const le = ESTADO.listaEstado || {};
  document.querySelectorAll('[data-lest]').forEach(el => {
    const e = le[el.dataset.lest];
    const nuevo = e ? hhmm(e.t) + ' · ' + e.txt : '';
    if (el.textContent !== nuevo) el.textContent = nuevo;
  });
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

  const lt = document.getElementById('listatexto');
  const lg = document.getElementById('listaguardar');
  const guardarLista = async () => {
    const cfg = ESTADO.cfg;
    cfg.lista = Object.assign({}, cfg.lista || {}, { texto: lt.value });
    await guardar(cfg);
    lt.blur();
    refrescar(true);
  };
  if (lg && lt) {
    lg.onclick = guardarLista;
    lt.onkeydown = e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); guardarLista(); } };
  }

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
  const escribiendo = foco && /INPUT|SELECT|TEXTAREA/.test(foco.tagName);
  const firma = JSON.stringify([st.cfg, st.unidades, st.aldeas, st.scan, st.edificios, st.herreria]);
  if (forzar || (!escribiendo && firma !== firmaEstructura)) { firmaEstructura = firma; estructura(); }
  pintarEstado();
}
refrescar(true);
setInterval(() => { if (TB_PANEL.abierto()) refrescar(false); }, 1000);
setInterval(tictac, 250);

}
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
  const segDe  = s => { const m = String(s || '').match(/(\d+):(\d\d):(\d\d)/); return m ? parseInt(m[1], 10) * 3600 + parseInt(m[2], 10) * 60 + parseInt(m[3], 10) : 0; };

  const q  = (lista, raiz) => { for (const s of lista) { const e = (raiz || document).querySelector(s); if (e) return e; } return null; };
  const qa = (lista, raiz) => { for (const s of lista) { const e = Array.from((raiz || document).querySelectorAll(s)); if (e.length) return e; } return []; };

  const bg = TB.bg;   // userscript: el núcleo atiende en la misma página

  const ss = {
    get: k => { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) {} },
    del: k => { try { sessionStorage.removeItem(k); } catch (e) {} },
    json: (k, d) => { try { return JSON.parse(sessionStorage.getItem(k) || 'null') || d; } catch (e) { return d; } },
  };

  const NOMBRE    = { tropas: 'Tropas', heroe: 'Héroe', farm: 'Farm list', recursos: 'Construcción', lista: 'TO DO' };
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
  function leerSlotsDorf2(raiz) {
    return $$('.buildingSlot', raiz).map(s => {
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
     eso el máximo se busca SÓLO en los <a>. Costo: .resourceWrapper
     .inlineIcon > i.r1Big..r4Big + el valor; tiempo POR UNIDAD:
     .inlineIcon.duration "0:01:04" (verificado 29/09). El hospital usa el
     mismo formulario ("Heal"). */
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
      const costo = [1, 2, 3, 4].map(i => { const ic = fila.querySelector('.resourceWrapper i.r' + i + 'Big'); return ic ? num(txt(ic.parentElement)) : 0; });
      const durEl = fila.querySelector('.inlineIcon.duration, .duration');
      return { t, u, nombre: nombre || ('unidad ' + t), max, input: inp, costo, dur: durEl ? segDe(txt(durEl)) : 0 };
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
  function leerCampos(raiz) {
    const cont = $('#resourceFieldContainer', raiz) || $('#village_map', raiz) || raiz || document;
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
  function leerStock(raiz) {
    const cur = [1, 2, 3, 4].map(i => num(txt($('#l' + i, raiz))));
    const pct = [1, 2, 3, 4].map(i => { const b = $('.stockBarButton.resource' + i + ' .bar', raiz); return b && b.style ? (parseFloat(b.style.width) || 0) : 0; });
    const capW = num((txt($('.warehouse', raiz)).match(/[\d.,]+/) || [''])[0]);
    const capG = num((txt($('.granary', raiz)).match(/[\d.,]+/) || [''])[0]);
    return { cur, pct, capW, capG };
  }

  /* botón verde de ampliar/mejorar de un edificio o campo — NUNCA el dorado
     ("master builder") ni el violeta ("25% faster") */
  function botonMejorar(raiz) {
    const cands = $$('.upgradeButtonsContainer button, .section1 button, button.build, button.contracting, .contractLink button', raiz);
    const ok = cands.find(b => /green/.test(cls(b)) && !/gold|purple|videoFeature|exchange|builder/.test(cls(b)));
    if (ok) return ok;
    const rx = /upgrade|ampliar|mejorar|ausbauen|construir|improve|build/i;
    return $$('button', raiz).find(b => rx.test(txt(b)) && /green/.test(cls(b)) && !/gold|purple|videoFeature|exchange|builder/.test(cls(b))) || null;
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

  /* ═══════════ 10b · aldeas al día ═══════════
     La lista de aldeas de la derecha (.listEntry.village[data-did] + .name)
     viene en el HTML de CUALQUIER página, también en las traídas por fetch, y
     trae todas (verificado 29/09: 12 de 12, con grupos). Antes las aldeas se
     leían sólo al escanear y nunca se borraban: la 05T, perdida el 28/09,
     seguía en la lista y Tropas perdía 3 cargas por vuelta intentando entrar. */
  function aldeasDelRecuadro(raiz) {
    return $$('.listEntry.village[data-did]', raiz)
      .map(e => ({ did: String(e.getAttribute('data-did') || ''), nombre: txt(e.querySelector('.name')) }))
      .filter(a => a.did);
  }
  async function sincronizarAldeas(raiz) {
    const nuevas = aldeasDelRecuadro(raiz);
    if (!nuevas.length || !INFO) return;
    const firma = l => l.map(a => a.did + ':' + normNombre(a.nombre)).sort().join('|');
    if (firma(nuevas) === firma(INFO.aldeas || [])) return;
    const r = await bg({ tipo: 'aldeasSync', aldeas: nuevas });
    if (r && Array.isArray(r.aldeas)) INFO.aldeas = r.aldeas;
  }
  let aldeasMiradas = false;   // una vez por carga de página

  /* ═══════════ 10c · TO DO LIST (sin navegar) ═══════════
     Pedido del usuario el 29/09: una lista por aldea (lista.js) y que cada
     aldea haga SÓLO eso; la farm list sigue de fondo (prioridad 1, la manda el
     service worker). La pestaña espera en /profile y TODO sale por pedidos
     directos, sin cargar páginas (el usuario lo autorizó ese día):
       · tropas y hospital: GET del edificio + POST de form[name=snd]
       · obras: GET del edificio + GET del enlace del botón verde
         (window.location.href = '/dorf2.php?id=…&action=build&checksum=…')
       · fiestas: /village/statistics/culturepoints dice dónde hay una
         (columna "Celebrations"); se pide con el enlace de su botón
         (build.php?id=…&gid=24&action=celebration&do=1|2&t=1)
       · recursos del héroe: PUT + POST a /api/v1/hero/v2/inventory/use-item
         (TwoStepAction del juego: el PUT devuelve x-nonce, el POST lo lleva);
         sirve para CUALQUIER aldea, sin cambiarla (verificado 29/09).
     Prioridad dentro de cada aldea (pedido del 29/09): 1) el establo hasta
     tener N h de cola (2 h), completando con los recursos del héroe; 2) las
     obras de la lista; 3) el hospital; 4) cuartel/taller hasta N h. Si la
     aldea no tiene obras pendientes, la cola sigue creciendo de a N h.
     MARGEN: un edificio vuelve a pedir recursos recién cuando su cola baja de
     N h − 20 min (y ahí se llena hasta N h). Sin margen, la cola baja segundo
     a segundo, el establo quedaba "apenas debajo de 2 h" en cada vuelta y se
     llevaba todo de a 1 unidad (29/09, primera prueba). */
  const ES_ESTABLO = g => g === 20 || g === 30;
  const PRIORIDAD_TROPA = [20, 30, 19, 29, 21];
  const CAMPO_EN = { 1: 'Woodcutter', 2: 'Clay Pit', 3: 'Iron Mine', 4: 'Cropland' };
  const miles = n => Math.round(n).toLocaleString('es-AR');
  const MARGEN = 1200;   // s
  let SYNC_RONDA = false;

  /* GET/POST de una página del juego; corta todo si aparece el captcha o se cerró la sesión */
  async function traer(url, opciones) {
    const d = await traerDoc(url, opciones);
    if ($('#botprotection, .botProtection, form[name="botprotection"], #bot_check', d)) { const e = new Error('antibot'); e.parar = 'Captcha / control antibot en TO DO'; throw e; }
    if (!$('input.villageInput', d) && $('input[type="password"]', d)) { const e = new Error('login'); e.parar = 'Sesión cerrada (TO DO)'; throw e; }
    if (!SYNC_RONDA) { SYNC_RONDA = true; await sincronizarAldeas(d); }
    return d;
  }
  const didDe = d => { const e = $('input.villageInput[data-did]', d); return e ? String(e.getAttribute('data-did')) : ''; };
  const urlDelBoton = b => { const m = (b && b.getAttribute('onclick') || '').match(/location\.href\s*=\s*'([^']+)'/); return m ? m[1].replace(/&amp;/g, '&') : ''; };

  /* formulario de entrenar/curar del edificio abierto */
  function formTropas(d, did, gid) {
    const b = $('#build', d);
    const gidDoc = b ? num((cls(b).match(/gid(\d+)/) || [])[1]) : 0;
    if (gidDoc !== gid) return { error: 'no abre (gid ' + gidDoc + ')' };
    const form = $('form[name="snd"]', d);
    if (!form) return { form: null, filas: [] };
    const didForm = $('input[name="did"]', form);
    if (didForm && String(didForm.value) !== String(did)) return { error: 'la aldea activa cambió' };
    return { form, filas: filasDeTropa(form) };
  }
  async function mandarFormTropas(d, form, filas, cant) {
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
    const d2 = await traer(destino, { method: 'POST', body: datos });
    return filasCola(d2) > antes;
  }

  /* — recursos del héroe — */
  const API_JSON = { 'Content-Type': 'application/json; charset=UTF-8' };
  async function inventarioHeroe() {
    const r = await fetch(location.origin + '/api/v1/hero/v2/screen/inventory', { credentials: 'include', headers: API_JSON });
    if (!r.ok) throw new Error('inventario del héroe: HTTP ' + r.status);
    const j = await r.json();
    const out = {};
    (j.itemsInventory || []).forEach(x => { if (x.typeId >= 145 && x.typeId <= 148) out[x.typeId - 144] = { id: x.id, n: num(x.amount) }; });
    return out;   // { 1: madera, 2: barro, 3: hierro, 4: cereal } → { id, n }
  }
  async function heroeARecursos(did, falta, inv) {
    inv = inv || await inventarioHeroe();
    const dado = [0, 0, 0, 0];
    const url = location.origin + '/api/v1/hero/v2/inventory/use-item';
    for (let i = 0; i < 4; i++) {
      const it = inv[i + 1];
      const n = Math.min(Math.floor(falta[i] || 0), it ? it.n : 0);
      if (n < 100) continue;
      const body = JSON.stringify({ action: 'inventory', itemId: it.id, amount: n, villageId: Number(did) });
      const r1 = await fetch(url, { method: 'PUT', credentials: 'include', headers: API_JSON, body });
      const nonce = r1.headers.get('x-nonce');
      if (!r1.ok || !nonce) { log('héroe: el juego no dejó usar ' + RECURSO[i + 1] + ' (HTTP ' + r1.status + ')'); continue; }
      const r2 = await fetch(url, { method: 'POST', credentials: 'include', headers: Object.assign({ 'X-Nonce': nonce }, API_JSON), body });
      if (r2.ok) dado[i] = n; else log('héroe: falló pasar ' + RECURSO[i + 1] + ' (HTTP ' + r2.status + ')');
      await dormir(azar(250, 600));
    }
    return dado;
  }

  /* — NPC con oro (pedido del 29/09: "si los recursos no alcanzan usar el
     resto y gastar oro en un NPC, pero sólo para movimientos grandes de 1-2 h
     de tropas o para subir alguna aldea"). Es otra TwoStepAction del juego:
     Travian.Game.PremiumFeature.NpcTrader → PUT/POST /api/v1/premium/npc-trader
     { villageId, desired: { lumber, clay, iron, crop }, action: 'premiumFeature' }
     (verificado en crypt.js y en el diálogo marketplace/exchange-resources el
     29/09). Cuesta 3 oro. Tope por día en el panel (cfg.lista.npcMaxDia). — */
  const NPC_MIN_SEG = 3600;   // tropas: el lote con NPC tiene que llenar al menos 1 h
  const suma = v => v.reduce((a, b) => a + b, 0);
  /* reparte el total de la aldea según `pedido` (lo que se quiere tener), sin
     pasarse del depósito; lo que sobra va adonde haya más lugar */
  function repartirNPC(st, pedido) {
    const caps = [st.capW, st.capW, st.capW, st.capG];
    const total = suma(st.cur) - 60;   // margen: el cereal puede bajar en los segundos que pasan
    const P = suma(pedido);
    if (!P || total <= 0) return null;
    /* el NPC de tropas u obras no se lleva el cereal: queda al menos lo que
       había, hasta el 15 % del granero (en las aldeas con cereal negativo, si
       llega a 0 % se mueren las tropas) */
    const minCereal = Math.min(st.cur[3], Math.floor(st.capG * 0.15));
    const sinCereal = pedido[0] + pedido[1] + pedido[2];
    let f = Math.min.apply(null, [1, total / P].concat([0, 1, 2, 3].filter(i => pedido[i] > 0).map(i => caps[i] / pedido[i])));
    if (sinCereal * f + Math.max(minCereal, pedido[3] * f) > total) f = Math.max(0, Math.min(f, (total - minCereal) / Math.max(1, sinCereal)));
    const d = pedido.map(p => Math.floor(p * f));
    d[3] = Math.max(d[3], minCereal);
    let resto = total - suma(d);
    for (let k = 0; k < 4 && resto > 0; k++) {
      const i = [0, 1, 2, 3].sort((a, b) => (caps[b] - d[b]) - (caps[a] - d[a]))[0];
      const n = Math.min(resto, caps[i] - d[i]);
      if (n <= 0) break;
      d[i] += n; resto -= n;
    }
    return d;
  }
  async function npcPermitido(critico) {
    const r = await bg({ tipo: 'npc', max: num(CFG.lista.npcMaxDia) || 30, critico: !!critico });
    if (r && r.ok) return true;
    if (r && !r.ok && ss.get('tb_npc_aviso') !== String(r.n) + (r.sinOro ? 'x' : '')) {
      ss.set('tb_npc_aviso', String(r.n) + (r.sinOro ? 'x' : ''));
      log(r.sinOro ? 'NPC: no alcanza el oro, no hago más NPC hoy' : 'NPC: ya van ' + r.n + ' hoy (el tope del panel), sigo sin NPC');
    }
    return false;
  }
  async function npcTrade(did, d) {
    const url = location.origin + '/api/v1/premium/npc-trader';
    const body = JSON.stringify({ villageId: Number(did), desired: { lumber: d[0], clay: d[1], iron: d[2], crop: d[3] }, action: 'premiumFeature' });
    const r1 = await fetch(url, { method: 'PUT', credentials: 'include', headers: API_JSON, body });
    const nonce = r1.headers.get('x-nonce');
    const t1 = await r1.text();
    if (!r1.ok || !nonce) return { ok: false, m: 'HTTP ' + r1.status + ' ' + t1.slice(0, 140), sinOro: /notenoughgold/i.test(t1) };
    const r2 = await fetch(url, { method: 'POST', credentials: 'include', headers: Object.assign({ 'X-Nonce': nonce }, API_JSON), body });
    const t2 = await r2.text();
    const ok = r2.ok && !/"error"/.test(t2);
    if (ok) await bg({ tipo: 'npc', sumar: true });
    else if (/notenoughgold/i.test(t2)) await bg({ tipo: 'npc', sinOro: true });
    return { ok, m: 'HTTP ' + r2.status + ' ' + t2.slice(0, 140), sinOro: /notenoughgold/i.test(t2) };
  }
  const fmtRec = d => d.map((v, i) => miles(v) + ' ' + RECURSO[i + 1]).join(' / ');

  /* — tropas de un edificio: cada grupo de la lista toma la primera alternativa
     que muestre el formulario; el máximo se reparte entre las elegidas — */
  async function entrenarLista(did, gid, grupos, op) {
    const nom = GIDN[gid] || 'gid' + gid;
    const s = slotDe(did, gid);
    const abrir = async () => {
      const d = await traer(urlEdificio(did, s ? s.aid : '', gid));
      const f = formTropas(d, did, gid);
      const sel = f.error || !f.form ? [] : grupos.map(g => TB_LISTA.elegirDelGrupo(g, f.filas)).filter((x, i, a) => x && a.indexOf(x) === i);
      return { d, f, sel };
    };
    let { d, f, sel } = await abrir();
    if (f.error) return nom + ': ' + f.error;
    if (!sel.length) return nom + ': no veo ' + grupos.map(g => g.join('/')).join(', ');
    let extra = '';
    // el NPC vale para cualquier edificio de tropas; el héroe, sólo para el establo (op.heroe)
    let usarNpc = CFG.lista.npc !== false && (op.heroe || op.npc);
    // sin la capacidad del depósito o el tiempo de la unidad no calculo: podría tirar recursos
    const stHeroe = (op.heroe || usarNpc) ? leerStock(d) : null;
    if (stHeroe && (!stHeroe.capW || !stHeroe.capG || sel.some(x => !x.dur))) {
      log('no leo el depósito o el tiempo de ' + nom + ' en ' + nombreDe(did) + ': sin héroe ni NPC esta vez');
      op.heroe = false; usarNpc = false;
    }
    if (op.heroe || usarNpc) {
      /* las unidades que faltan para llegar a N h de cola (repartidas entre
         las elegidas), recortadas a lo que alcanza entre la aldea y el héroe
         y a lo que entra en el depósito: si al héroe no le queda madera, no
         tiene sentido pasarle hierro (29/09: a 010 le pasó 24k de hierro solo). */
      const st = stHeroe;
      const inv = op.heroe ? await inventarioHeroe() : {};
      // el cereal del héroe queda de reserva para el rescate de cereal (pedido del 29/09)
      const heroe = [1, 2, 3, 4].map(r => r !== 4 && inv[r] ? inv[r].n : 0);
      const cap = i => i === 3 ? st.capG : st.capW;
      const seg = Math.max(0, op.H - op.cola) / sel.length;
      let ns = sel.map(x => Math.ceil(seg / x.dur));
      const pedidoDe = v => [0, 1, 2, 3].map(i => sel.reduce((a, x, j) => a + v[j] * x.costo[i], 0));
      let pedido = pedidoDe(ns);
      const tope = Math.min.apply(null, [1].concat([0, 1, 2, 3].filter(i => pedido[i] > 0)
        .map(i => Math.min(st.cur[i] + heroe[i], cap(i)) / pedido[i])));
      /* ¿NPC? Si por tipo no alcanza pero sumando todo (aldea + lo que el héroe
         puede pasar) sí, y así el lote llena ≥1 h (y 30 min más que sin NPC):
         paso del héroe lo que falte en TOTAL (primero lo que más tiene: el
         hierro y el cereal que sobran), reparto con el NPC y entreno. */
      if (tope < 1 && usarNpc) {
        const faltanSeg = Math.max(0, op.H - op.cola);
        const lugar = [0, 1, 2, 3].map(i => Math.max(0, Math.min(heroe[i], cap(i) - st.cur[i])));
        const P = suma(pedido);
        const fx = Math.min.apply(null, [1, (suma(st.cur) + suma(lugar)) / P].concat([0, 1, 2, 3].filter(i => pedido[i] > 0).map(i => cap(i) / pedido[i])));
        if (fx * faltanSeg >= NPC_MIN_SEG && (fx - tope) * faltanSeg >= 1800 && await npcPermitido()) {
          const pasar = [0, 0, 0, 0];
          let resto = Math.max(0, Math.ceil(fx * P) - suma(st.cur));
          [0, 1, 2, 3].sort((a, b) => lugar[b] - lugar[a]).forEach(i => { const n = Math.min(lugar[i], resto); pasar[i] = n; resto -= n; });
          if (suma(pasar) >= 100) {
            const dado = await heroeARecursos(did, pasar, inv);
            if (dado.some(v => v)) extra = ' (héroe: ' + dado.map((v, i) => v ? miles(v) + ' ' + RECURSO[i + 1] : '').filter(Boolean).join(', ') + ')';
            await dormir(azar(400, 900));
            ({ d, f, sel } = await abrir());
            if (f.error || !sel.length) return nom + ': ' + (f.error || 'no veo las unidades') + extra;
          }
          const deseado = repartirNPC(leerStock(d), pedido);
          if (deseado) {
            const r = await npcTrade(did, deseado);
            if (r.ok) {
              log('💱 NPC en ' + nombreDe(did) + ' para ' + Math.round(fx * faltanSeg / 60) + ' min de ' + nom + ': ' + fmtRec(deseado) + extra + ' (3 oro)');
              extra += ' · NPC';
              await dormir(azar(400, 900));
              ({ d, f, sel } = await abrir());
              if (f.error || !sel.length) return nom + ': ' + (f.error || 'no veo las unidades') + extra;
            } else log('NPC en ' + nombreDe(did) + ' falló: ' + r.m);
          }
          op.heroe = false;   // ya está: sigue con entrenar el máximo
        }
      }
      if (op.heroe && tope < 1) { ns = ns.map(n => Math.floor(n * tope)); pedido = pedidoDe(ns); }
      const falta = pedido.map((p, i) => Math.min(Math.max(0, p - st.cur[i]), Math.max(0, cap(i) - st.cur[i]), heroe[i]));
      // de a poco no: menos de 1.000 en total lo pone la aldea sola en un rato
      if (op.heroe && ns.some(n => n > 0) && falta.reduce((a, v) => a + v, 0) >= 1000) {
        const dado = await heroeARecursos(did, falta, inv);
        if (dado.some(v => v)) {
          extra = ' (héroe: ' + dado.map((v, i) => v ? miles(v) + ' ' + RECURSO[i + 1] : '').filter(Boolean).join(', ') + ')';
          log('héroe → ' + nombreDe(did) + ': ' + dado.map((v, i) => v ? miles(v) + ' ' + RECURSO[i + 1] : '').filter(Boolean).join(', ') +
              ' para llegar a ' + Math.round(op.H / 3600) + ' h de ' + nom);
          await dormir(azar(400, 900));
          ({ d, f, sel } = await abrir());
          if (f.error || !sel.length) return nom + ': ' + (f.error || 'no veo las unidades') + extra;
        }
      }
    }
    // PRIORIDAD: sólo lo que sobra por encima de la reserva, repartido entre las elegidas
    const res = op.reserva && op.reserva.costo;
    const libre = res ? leerStock(d).cur.map((v, i) => Math.max(0, v - (res[i] || 0))) : null;
    const cant = {}, partes = [];
    sel.forEach(x => {
      let n = Math.floor(x.max / sel.length);
      if (libre) {
        if (!x.costo || !suma(x.costo)) n = 0;   // sin el costo no sé cuánto deja: no toco la reserva
        else [0, 1, 2, 3].forEach(i => { if (x.costo[i] > 0) n = Math.min(n, Math.floor(libre[i] / sel.length / x.costo[i])); });
      }
      if (n >= 1) { cant[x.t] = n; partes.push(n + ' × ' + x.nombre); }
    });
    if (!partes.length) return nom + ': sin recursos' + (libre ? ' (lo demás queda reservado para ' + op.reserva.para + ')' : '') + extra;
    if (libre) extra += ' · 🔒 con lo que sobra de la reserva';
    const ok = await mandarFormTropas(d, f.form, f.filas, cant);
    log(nom + ' de ' + nombreDe(did) + ': ' + partes.join(', ') + (ok ? ' ✔' : ' (mandado, la cola no cambió a la vista)') + extra);
    return nom + ': ' + partes.join(', ') + (ok ? ' ✔' : '') + extra;
  }

  /* modo 'caballos': sólo el establo, si tiene menos de H de cola.
     modo 'resto': el primero por prioridad con menos de H; si `crecer`, el
     límite sube de a H hasta 24 h (aldeas sin obras pendientes). */
  async function tropasLista(did, ordenes, colas, H, modo, crecer, reserva) {
    const plan = TB_LISTA.planTropas(ordenes, (INFO && INFO.unidades) || {}, did);
    const gids = PRIORIDAD_TROPA.filter(g => plan.porGid[g]);
    if (!gids.length) return plan.faltan.length && modo === 'resto' ? 'tropas: no veo ' + plan.faltan.join(', ') + ' (¿sin investigar?)' : null;
    const q = (colas && colas[did]) || {};
    const cola = g => Math.max(0, q[g] || 0);
    const existe = g => q[g] !== -1;
    const m = Math.min(MARGEN, H / 4);
    let gid = 0;
    if (modo === 'caballos') {
      gid = gids.find(g => ES_ESTABLO(g) && existe(g) && cola(g) < H - m) || 0;
    } else {
      for (let lim = H; lim <= (crecer ? 24 * 3600 : H); lim += H) {
        gid = gids.find(g => existe(g) && cola(g) < lim - m) || 0;
        if (gid) break;
      }
    }
    if (!gid) return null;
    return entrenarLista(did, gid, plan.porGid[gid], {
      cola: cola(gid), H,
      // sin leer las colas no sé cuánto falta: ni héroe ni NPC
      heroe: modo === 'caballos' && !!colas && CFG.lista.heroe !== false && !reserva,
      npc: !!colas && !reserva,
      reserva,
    });
  }

  async function curarHospital(did) {
    const s = slotDe(did, 46);
    if (!s) return 'hospital: esta aldea no tiene';
    const d = await traer(urlEdificio(did, s.aid, 46));
    const f = formTropas(d, did, 46);
    if (f.error) return 'hospital: ' + f.error;
    const heridos = f.filas.filter(x => x.max > 0);
    if (!f.filas.length) return 'hospital vacío';
    if (!heridos.length) return 'hospital: sin recursos para curar';
    const cant = {}, partes = [];
    heridos.forEach(x => { const n = Math.floor(x.max / heridos.length); if (n >= 1) { cant[x.t] = n; partes.push(n + ' × ' + x.nombre); } });
    if (!partes.length) return 'hospital: sin recursos para curar';
    const ok = await mandarFormTropas(d, f.form, f.filas, cant);
    log('hospital de ' + nombreDe(did) + ': curo ' + partes.join(', ') + (ok ? ' ✔' : ''));
    return 'hospital: curo ' + partes.join(', ') + (ok ? ' ✔' : '');
  }

  /* obras de la lista. Cada orden cubre TODAS las copias del edificio (04T
     tiene 5 almacenes: "Warehouse 20" es subir los que estén abajo). Se pide
     la primera orden, en el orden de la lista, que tenga algo en verde.
     Devuelve { txt, pendientes }.
     Lo pedido se recuerda por casilla (ctx.pedidos, 4 h): con la cola del
     Plus, una obra que espera turno NO sale "underConstruction" en dorf1/2 y
     el bot la volvía a pedir (29/09: 5 veces "Almacén 1→2" para 3 almacenes,
     el mismo campo dos veces en 11 y 12 → un campo con tope 10 podía quedar en 11). */
  const clavePedido = (did, x) => did + '|' + (x.campo ? 'c' + x.id : 'a' + x.aid);
  function pedidoVivo(ctx, did, x) {
    const p = ctx.pedidos[clavePedido(did, x)];
    return p && ahora() - p.t < 4 * 3600000 && x.nivel < p.n ? p : null;
  }
  const anotarPedido = (ctx, did, x) => { ctx.pedidos[clavePedido(did, x)] = { n: x.nivel + 1, t: ahora(), g: x.gid }; };

  // casillas de edificio comunes: la 39 (plaza de reuniones) y la 40 (muralla) son fijas
  const CASILLA_LIBRE = x => x.gid === 0 && x.aid >= 19 && x.aid <= 38;
  // pestaña de la ficha de construcción de cada edificio (1 infraestructura, 2 militar, 3 recursos)
  const CATEGORIA = { 5: 3, 6: 3, 7: 3, 8: 3, 9: 3, 13: 2, 14: 2, 16: 2, 19: 2, 20: 2, 21: 2, 22: 2, 29: 2, 30: 2, 36: 2, 37: 2, 46: 2, 48: 2 };
  const costoDe = raiz => [1, 2, 3, 4].map(i => { const ic = $('i.r' + i + 'Big', raiz); return ic ? num(txt(ic.parentElement)) : 0; });
  const RX_FALTA_REC = /enough resources|recursos suficientes|genug rohstoffe/i;
  const RX_OBRERO = /worker|obrero|builder|bauarbeiter|already at work|queue/i;

  /* edificio que la aldea NO tiene (pedido del 30/09, Plaza de torneos en 01):
     build.php?id=<casilla vacía>&category=N trae un #contract_building<gid>
     dentro de .buildingWrapper, con el costo en i.r1Big…r4Big y el botón verde
     "Construct building" (onclick → /dorf2.php?id=…&gid=…&action=build&checksum=…).
     Si falta algo: NPC dorado + .errorMessage ("Enough resources on …"); si no
     cumple requisitos va en "Soon available buildings" sin botón verde
     (verificado 30/09 en una casilla vacía de 12).
     → { destino, estado: 'ok'|'recursos'|'obrero'|'requisitos', msg, costo, en } o { error } */
  async function fichaNueva(did, aid, gid) {
    const cats = [CATEGORIA[gid] || 1, 1, 2, 3].filter((c, i, a) => a.indexOf(c) === i);
    for (const c of cats) {
      const d = await traer(location.origin + '/build.php?newdid=' + did + '&id=' + aid + '&category=' + c);
      if (didDe(d) !== did) return { error: 'no pude entrar a la aldea' };
      const w = $('#contract_building' + gid, d);
      if (!w) { await dormir(azar(300, 700)); continue; }
      const wr = w.closest('.buildingWrapper') || w;
      const b = $$('button', wr).find(x => /green/.test(cls(x)) && !/gold|purple|videoFeature|exchange|builder/.test(cls(x)));
      const u = b && !botonApagado(b) ? urlDelBoton(b) : '';
      const destino = u && new RegExp('[?&]gid=' + gid + '(&|$)').test(u) && /action=build/.test(u) ? u : '';
      const msg = txt($('.errorMessage', wr));
      const estado = destino ? 'ok' : RX_FALTA_REC.test(msg) ? 'recursos' : RX_OBRERO.test(msg) ? 'obrero' : 'requisitos';
      return { destino, estado, msg, costo: costoDe(wr), en: txt($('h2', wr)).replace(/^\d+\.\s*/, '') };
    }
    return { error: 'no la veo en la ficha de construcción (¿casilla ocupada?)' };
  }

  /* PRIORIDAD: lo que cuesta el próximo nivel de la obra marcada con "!".
     Las tropas de la aldea no tocan esos recursos mientras no esté cumplida.
     Si lo que falta son requisitos (o un depósito más grande), no se reserva
     nada: si no, las tropas quedarían paradas para siempre. */
  async function reservaPrio(did, x) {
    await dormir(azar(300, 700));
    let costo, msg;
    if (x.nuevo) {
      const f = await fichaNueva(did, x.aid, x.gid);
      if (f.error || f.estado === 'requisitos') return null;
      costo = f.costo; msg = '';
    } else {
      const b = await traer(x.campo ? urlSlot(did, x.id) : urlEdificio(did, x.aid, x.gid));
      if (didDe(b) !== did) return null;
      const up = $('.upgradeBuilding', b) || $('#build', b) || b;
      costo = costoDe(up); msg = txt($('.errorMessage', up));
    }
    if (!suma(costo)) return null;
    if (msg && !RX_FALTA_REC.test(msg) && !RX_OBRERO.test(msg)) return null;
    return { costo, para: x.nombre || 'la obra' };
  }

  async function obrasLista(did, ordenes, ctx) {
    // lo marcado con "!" (PRIORIDAD) va primero; lo demás, en el orden de la lista
    const obras = ordenes.filter(o => o.tipo === 'campos' || o.tipo === 'edificio')
                         .sort((a, b) => (b.prio ? 1 : 0) - (a.prio ? 1 : 0));
    if (!obras.length) return null;
    if (ctx.espera[did] && ahora() < ctx.espera[did].t) return { txt: ctx.espera[did].txt, pendientes: true, reserva: ctx.espera[did].reserva || null };
    const conCampos = obras.some(o => o.tipo === 'campos'), conEdif = obras.some(o => o.tipo === 'edificio');
    const d1 = conCampos ? await traer(urlDorf1(did)) : null;
    if (d1 && conEdif) await dormir(azar(300, 700));
    const d2 = conEdif ? await traer(urlDorf2(did)) : null;
    if ((d1 && didDe(d1) !== did) || (d2 && didDe(d2) !== did)) return { txt: 'obras: no pude entrar a la aldea', pendientes: true };
    const campos = d1 ? leerCampos(d1) : [];
    const slots = d2 ? leerSlotsDorf2(d2) : [];
    if (slots.length) { bg({ tipo: 'edificiosDe', did, slots }); if (INFO.edificios) INFO.edificios[did] = slots; }
    const enObra = $$('.buildingList li', d1 || d2).length;
    let pendientes = 0, cand = null, primera = null, prioX = null;
    const notas = [];
    const vacias = slots.filter(CASILLA_LIBRE);
    const pedidoEn = (aid, gid) => { const p = ctx.pedidos[did + '|a' + aid]; return p && ahora() - p.t < 4 * 3600000 && (gid == null || p.g === gid) ? p : null; };
    for (const o of obras) {
      let lista;
      if (o.tipo === 'campos') {
        lista = campos.filter(x => o.tipos.indexOf(x.gid) >= 0 && x.nivel < o.max && !/maxLevel/.test(x.estado))
                      .map(x => ({ id: x.id, gid: x.gid, nivel: x.nivel, estado: x.estado, nombre: RECURSO[x.gid], en: CAMPO_EN[x.gid], campo: true }));
      } else {
        const gidO = o.gid || ((slots.find(x => x.aid === 40 && TB_LISTA.GIDS_MURALLA.indexOf(x.gid) >= 0) || slots.find(x => TB_LISTA.GIDS_MURALLA.indexOf(x.gid) >= 0) || {}).gid) || 0;
        const deEse = slots.filter(x => x.gid === gidO);
        if (!deEse.length) {
          // no la tiene: se construye en una casilla libre (las murallas no: van en la 40)
          const construible = o.gid && TB_LISTA.GIDS_MURALLA.indexOf(o.gid) < 0;
          const casilla = construible ? (vacias.find(x => pedidoEn(x.aid, o.gid)) || vacias.find(x => !pedidoEn(x.aid))) : null;
          if (!casilla) { notas.push(TB_LISTA.describir(o) + ': no existe en la aldea' + (construible ? ' y no hay casilla libre' : '')); continue; }
          lista = [{ aid: casilla.aid, gid: o.gid, nivel: 0, estado: 'nuevo', nombre: TB_LISTA.NOMBRE_ES[o.gid], en: TB_LISTA.NOMBRE_ES[o.gid], nuevo: true }];
        } else {
          lista = deEse.filter(x => x.nivel < o.max && !/maxLevel/.test(x.estado))
                       .map(x => ({ aid: x.aid, gid: x.gid, nivel: x.nivel, estado: x.estado, nombre: TB_LISTA.NOMBRE_ES[x.gid] || x.nombre, en: x.nombre }));
        }
      }
      // lo ya pedido cuenta con el nivel pedido
      lista = lista.filter(x => { const pv = pedidoVivo(ctx, did, x); return !(pv && pv.n >= o.max); });
      if (!lista.length) continue;   // cumplida
      pendientes++;
      if (o.prio && !prioX) prioX = lista.slice().sort((a, b) => a.nivel - b.nivel)[0];
      const libres = lista.filter(x => !pedidoVivo(ctx, did, x));
      const listo = libres.filter(x => /good|nuevo/.test(x.estado)).sort((a, b) => a.nivel - b.nivel)[0];
      if (listo && !cand) cand = listo;
      if (!primera) primera = libres.filter(x => !/underConstruction|nuevo/.test(x.estado)).sort((a, b) => a.nivel - b.nivel)[0] || null;
    }
    if (!pendientes) return { txt: (notas.length ? notas : ['obras: todo cumplido ✔']).join(' · '), pendientes: false };
    // cada salida con algo pendiente: si hay PRIORIDAD, anota la reserva para las tropas
    const cierre = async (t, esperar) => {
      const reserva = prioX ? await reservaPrio(did, prioX) : null;
      const tt = reserva ? t + ' · 🔒 reservo ' + fmtRec(reserva.costo) + ' para ' + reserva.para : t;
      if (esperar) ctx.espera[did] = { t: ahora() + azar(120000, 180000), txt: tt, reserva };
      else delete ctx.espera[did];
      return { txt: tt, pendientes: true, reserva };
    };
    if (!cand && primera && CFG.lista.npc !== false) {
      const r = await obraConNPC(did, primera, ctx);
      if (r) return cierre(notas.concat([r]).join(' · '), false);
    }
    if (!cand) return cierre(notas.concat(['obras: esperando ' + (enObra ? 'al obrero (' + enObra + ' en obra)' : 'recursos')]).join(' · '), true);
    await dormir(azar(400, 900));
    let destino = '';
    if (cand.nuevo) {
      const f = await fichaNueva(did, cand.aid, cand.gid);
      if (f.error || !f.destino) {
        const porque = f.error || { recursos: 'esperando recursos', obrero: 'esperando al obrero', requisitos: 'le faltan requisitos (' + (f.msg || 'mirá la ficha') + ')' }[f.estado];
        return cierre(notas.concat(['obras: construir ' + cand.nombre + ' — ' + String(porque).slice(0, 80)]).join(' · '), true);
      }
      if (f.en) cand.en = f.en;
      destino = f.destino;
    } else {
      const b = await traer(cand.campo ? urlSlot(did, cand.id) : urlEdificio(did, cand.aid, cand.gid));
      const boton = botonMejorar(b);
      destino = boton && !botonApagado(boton) && didDe(b) === did ? urlDelBoton(boton) : '';
      if (!destino) return cierre('obras: ' + cand.nombre + ' nv' + cand.nivel + ' sin botón (' + (txt($('.errorMessage', b)) || 'no se puede ahora').slice(0, 60) + ')', true);
    }
    await dormir(azar(500, 1100));
    const r = await traer(new URL(destino, location.origin + '/').href);
    anotarPedido(ctx, did, cand);
    const ok = $$('.buildingList li', r).some(li => normNombre(txt(li)).indexOf(normNombre(cand.en || '')) >= 0);
    const hecho = cand.nuevo ? '🏗 ' + cand.nombre + ' (nueva, casilla ' + cand.aid + ')' : '⬆ ' + cand.nombre + ' ' + cand.nivel + '→' + (cand.nivel + 1);
    log((cand.nuevo ? '🏗 ' + nombreDe(did) + ': construyo ' + cand.nombre + ' en la casilla ' + cand.aid : '⬆ ' + nombreDe(did) + ': ' + cand.nombre + ' ' + cand.nivel + '→' + (cand.nivel + 1)) + (ok ? ' ✔' : ' (pedido, no lo veo en la cola)'));
    return cierre(notas.concat([hecho + (ok ? ' ✔' : '')]).join(' · '), false);
  }

  /* NPC para una obra: sólo si el obrero está libre, faltan ≥1 h para tener
     los recursos, cuesta ≥2.000 en total (si no, no vale 3 oro) y el total de
     la aldea alcanza. En la página del edificio: .upgradeBuilding i.rNBig =
     costo del nivel siguiente, .errorMessage .timer[value] = segundos que
     faltan ("Enough resources on …"), verificado el 29/09. */
  async function obraConNPC(did, c, ctx) {
    const url = c.campo ? urlSlot(did, c.id) : urlEdificio(did, c.aid, c.gid);
    await dormir(azar(300, 700));
    const b = await traer(url);
    if (didDe(b) !== did) return null;
    const up = $('.upgradeBuilding', b) || $('#build', b) || b;
    const msg = txt($('.errorMessage', up));
    if (!/enough resources|recursos suficientes|genug rohstoffe/i.test(msg)) return null;   // obrero ocupado u otra cosa
    const tm = $('.errorMessage .timer', up);
    const espera = tm ? num(tm.getAttribute('value')) : 0;
    const costo = [1, 2, 3, 4].map(i => { const ic = $('i.r' + i + 'Big', up); return ic ? num(txt(ic.parentElement)) : 0; });
    const st = leerStock(b);
    if (!suma(costo) || !st.capW || !st.capG) return null;
    if (espera && espera < 3600) return null;
    if (suma(costo) < 2000) return null;
    if (suma(st.cur) - 60 < suma(costo)) return null;
    if (costo.some((x, i) => x > (i === 3 ? st.capG : st.capW))) return null;
    if (!(await npcPermitido())) return null;
    const deseado = repartirNPC(st, costo);
    if (!deseado) return null;
    const r = await npcTrade(did, deseado);
    if (!r.ok) { log('NPC en ' + nombreDe(did) + ' falló: ' + r.m); return null; }
    log('💱 NPC en ' + nombreDe(did) + ' para ' + c.nombre + ' ' + c.nivel + '→' + (c.nivel + 1) + ' (faltaban ' + Math.round(espera / 60) + ' min): ' + fmtRec(deseado) + ' (3 oro)');
    await dormir(azar(500, 1000));
    const b2 = await traer(url);
    const boton = botonMejorar(b2);
    const destino = boton && !botonApagado(boton) ? urlDelBoton(boton) : '';
    if (!destino) return '💱 NPC hecho, pero ' + c.nombre + ' sigue sin botón';
    await dormir(azar(500, 1100));
    const rr = await traer(new URL(destino, location.origin + '/').href);
    anotarPedido(ctx, did, c);
    const ok = $$('.buildingList li', rr).some(li => normNombre(txt(li)).indexOf(normNombre(c.en || '')) >= 0);
    log('⬆ ' + nombreDe(did) + ': ' + c.nombre + ' ' + c.nivel + '→' + (c.nivel + 1) + ' con NPC' + (ok ? ' ✔' : ' (pedido, no lo veo en la cola)'));
    return '💱 NPC + ⬆ ' + c.nombre + ' ' + c.nivel + '→' + (c.nivel + 1) + (ok ? ' ✔' : '');
  }

  /* ═ rescate de cereal (pedido del 29/09) ═
     /village/statistics/resources/warehouse: por aldea el % del granero y el
     tiempo hasta llenarse o, si el cereal baja, "− h:mm:ss" en rojo (span.crit)
     = hasta vaciarse. Si llega a 0 % se mueren las tropas. SÓLO las rojas:
     cuando el granero baja al 5 % (o le quedan ≤10 min: la 04T vaciaba un 21 %
     en 26 min) se sube al 15 %: primero con el cereal del héroe (el único uso
     de su cereal); si no alcanza, NPC que convierte lo demás en cereal (antes,
     si a la aldea no le alcanza, el héroe pasa madera/barro/hierro). El NPC de
     rescate no cuenta para el tope del día. */
  const RESCATE_DISPARO = 5, RESCATE_OBJETIVO = 15, RESCATE_SEG = 600;
  async function rescateCereal(ctx) {
    const d = await traer(location.origin + '/village/statistics/resources/warehouse');
    const t = $$('table', $('#content', d) || d).pop();
    if (!t || t.rows.length < 2) { log('cereal: no leo la tabla de depósitos'); return; }
    ctx.rojas = {};   // la tabla se leyó: estas son las rojas de AHORA
    let col = Array.from(t.rows[0].cells).findIndex(c => $('.r4, i.r4, [class~="r4"]', c) || /\br4\b/.test(cls(c)));
    if (col < 1) col = 5;
    for (const r of Array.from(t.rows).slice(1)) {
      const c = Array.from(r.cells);
      if (c.length <= col + 1) continue;
      const a = c[0].querySelector('a[href*="newdid="]');
      const did = a ? ((a.getAttribute('href') || '').match(/newdid=(\d+)/) || [])[1] : '';
      if (!did || !c[col + 1].querySelector('.crit')) continue;   // sólo las rojas
      const pct = num(txt(c[col])), vacio = segDe(txt(c[col + 1]));
      ctx.rojas[did] = pct;
      ctx.cereal[did] = '🌾 ' + pct + '% (se vacía en ' + fmtCola(vacio) + ')';
      if (pct > RESCATE_DISPARO && !(vacio && vacio <= RESCATE_SEG)) continue;
      try { ctx.cereal[did] = await rescatarCereal(did, pct, vacio); }
      catch (e) { if (e && e.parar) throw e; log('cereal de ' + nombreDe(did) + ': ' + (e && e.message ? e.message : e)); }
    }
  }
  async function rescatarCereal(did, pct, vacio) {
    bg({ tipo: 'trabajando', rol: ROL });
    let d = await traer(urlDorf1(did));
    if (didDe(d) !== did) return '🌾 rescate: no pude entrar';
    let st = leerStock(d);
    if (!st.capG) return '🌾 rescate: no leo el granero';
    const objetivo = Math.floor(st.capG * RESCATE_OBJETIVO / 100);
    if (st.cur[3] >= objetivo) return null;
    const partes = [];
    const usarHeroe = CFG.lista.heroe !== false;
    let inv = null;
    if (usarHeroe) { try { inv = await inventarioHeroe(); } catch (e) {} }
    // 1 · el cereal del héroe
    const cerealHeroe = inv && inv[4] ? inv[4].n : 0;
    if (cerealHeroe >= 100) {
      const dado = await heroeARecursos(did, [0, 0, 0, Math.min(objetivo - st.cur[3], cerealHeroe)], inv);
      if (dado[3]) { partes.push('héroe ' + miles(dado[3]) + ' cereal'); st.cur[3] += dado[3]; }
    }
    // 2 · si todavía falta: NPC que pasa lo demás a cereal
    if (objetivo - st.cur[3] > st.capG * 0.01) {
      await dormir(azar(300, 700));
      d = await traer(urlDorf1(did));
      st = leerStock(d);
      const falta = objetivo - st.cur[3];
      const otros = st.cur[0] + st.cur[1] + st.cur[2];
      if (otros < falta && inv) {
        // a la aldea no le alcanza: el héroe pone madera/barro/hierro para convertir
        const pasar = [0, 0, 0, 0];
        let resto = falta - otros;
        [0, 1, 2].sort((a, b) => (inv[b + 1] ? inv[b + 1].n : 0) - (inv[a + 1] ? inv[a + 1].n : 0)).forEach(i => {
          const n = Math.max(0, Math.min(inv[i + 1] ? inv[i + 1].n : 0, st.capW - st.cur[i], resto));
          pasar[i] = n; resto -= n;
        });
        if (suma(pasar) >= 100) {
          const dado = await heroeARecursos(did, pasar, inv);
          if (suma(dado)) {
            partes.push('héroe ' + dado.map((v, i) => v ? miles(v) + ' ' + RECURSO[i + 1] : '').filter(Boolean).join(', '));
            await dormir(azar(300, 700));
            d = await traer(urlDorf1(did));
            st = leerStock(d);
          }
        }
      }
      // sin el NPC tildado no se gasta oro, ni siquiera en el rescate
      if (CFG.lista.npc === false) partes.push('sin NPC (apagado en el panel)');
      else if (await npcPermitido(true)) {
        const total = suma(st.cur) - 60;
        const cereal = Math.min(objetivo, st.capG, total);
        const resto = total - cereal;
        const o = st.cur[0] + st.cur[1] + st.cur[2];
        const deseado = [0, 1, 2].map(i => Math.min(st.capW, Math.floor(resto * (o ? st.cur[i] / o : 1 / 3))));
        deseado[3] = Math.min(st.capG, total - suma(deseado));
        if (deseado[3] > st.cur[3]) {
          const r = await npcTrade(did, deseado);
          partes.push(r.ok ? 'NPC → ' + miles(deseado[3]) + ' cereal (3 oro)' : 'NPC falló: ' + r.m);
        }
      } else partes.push('sin NPC (sin oro)');
    }
    const txtR = '🌾 rescate ' + pct + '% → ' + RESCATE_OBJETIVO + '%: ' + (partes.join(' + ') || 'nada que hacer');
    log(txtR.replace('rescate', 'rescate de cereal en ' + nombreDe(did)) + ' (se vaciaba en ' + fmtCola(vacio) + ')');
    return txtR;
  }

  /* fiestas: una página dice cuáles aldeas ya tienen una. Grande si el
     ayuntamiento es nv10+ y su botón está habilitado; si no, la chica. */
  async function fiestasLista(P, ctx) {
    const quieren = Object.keys(P.porAldea).filter(did => P.porAldea[did].ordenes.some(o => o.tipo === 'fiestas'));
    if (!quieren.length) return;
    const sumar = (did, t) => { ctx.est[did] = (ctx.est[did] ? ctx.est[did] + ' · ' : '') + t; };
    if (ahora() - ctx.ultFiestas < 240000) { quieren.forEach(did => { if (ctx.fiestaAntes[did]) sumar(did, ctx.fiestaAntes[did]); }); return; }
    ctx.ultFiestas = ahora();
    ctx.fiestaAntes = {};
    const d = await traer(location.origin + '/village/statistics/culturepoints');
    const t = $$('table', $('#content', d) || d)[0];
    if (!t || t.rows.length < 2) { log('fiestas: no leo la tabla de puntos de cultura'); return; }
    const cab = Array.from(t.rows[0].cells).map(c => txt(c));
    let col = cab.findIndex(x => /celebra|fiesta|fest/i.test(x));
    if (col < 0) col = 2;
    const porNombre = {};
    Array.from(t.rows).slice(1).forEach(r => { if (r.cells.length > col) porNombre[normNombre(txt(r.cells[0]))] = txt(r.cells[col]); });
    for (const did of quieren) {
      const nota = s => { sumar(did, s); ctx.fiestaAntes[did] = s; };
      const quiereGrande = P.porAldea[did].ordenes.some(o => o.tipo === 'fiestas' && o.grande);
      const celda = porNombre[normNombre(nombreDe(did))];
      if (celda && /\d+:\d\d:\d\d/.test(celda)) { nota('fiesta ⏳ ' + celda); continue; }
      const th = slotDe(did, 24);
      if (!th) { nota('fiesta: sin ayuntamiento'); continue; }
      bg({ tipo: 'trabajando', rol: ROL });
      await dormir(azar(400, 900));
      const p = await traer(urlEdificio(did, th.aid, 24) + '&t=1');
      if (didDe(p) !== did) continue;
      const nivel = num((cls($('#build', p)).match(/level(\d+)/) || [])[1]);
      const botones = $$('button', $('#build', p) || p).map(b => ({ b, url: urlDelBoton(b) })).filter(x => /action=celebration/.test(x.url));
      const habil = x => !!x && !botonApagado(x.b);
      const grande = botones.find(x => /[?&]do=2\b/.test(x.url)), chica = botones.find(x => /[?&]do=1\b/.test(x.url));
      /* PRIORIDAD: la fiesta no se come la reserva de la obra marcada con "!"
         (costos fijos de Travian: chica 6.400/6.650/5.940/1.340, grande
         29.700/33.250/32.000/6.700) */
      const res = ctx.reservas && ctx.reservas[did];
      const st = res ? leerStock(p) : null;
      const alcanza = c => !res || c.every((v, i) => st.cur[i] - v >= (res.costo[i] || 0));
      const okG = habil(grande) && alcanza([29700, 33250, 32000, 6700]), okC = habil(chica) && alcanza([6400, 6650, 5940, 1340]);
      const elegida = (quiereGrande && nivel >= 10 && okG) ? grande : (okC ? chica : null);
      if (!elegida) { nota('fiesta: ' + (res && (habil(grande) || habil(chica)) ? 'espera, primero ' + res.para : 'sin recursos')); continue; }
      await dormir(azar(500, 1100));
      const r = await traer(new URL(elegida.url, location.origin + '/').href);
      const cual = elegida === grande ? 'grande' : 'chica';
      log('🎉 fiesta ' + cual + ' en ' + nombreDe(did) + (didDe(r) === did ? ' ✔' : ' (ojo: la respuesta vino de otra aldea)'));
      nota('🎉 fiesta ' + cual);
    }
  }

  /* aldea sin datos (nueva, o con una unidad de la lista que no aparece):
     dorf2 + sus cuarteles/establos/talleres, por fetch. A lo sumo cada 2 h. */
  async function escanearAldeaFetch(did) {
    const marcas = ss.json('tb_lscan', {});
    if (ahora() - (marcas[did] || 0) < 7200000) return;
    marcas[did] = ahora(); ss.set('tb_lscan', JSON.stringify(marcas));
    const d = await traer(urlDorf2(did));
    if (didDe(d) !== did) return;
    const slots = leerSlotsDorf2(d);
    if (!slots.length) return;
    await bg({ tipo: 'edificiosDe', did, slots });
    INFO.edificios = Object.assign({}, INFO.edificios || {}, { [did]: slots });
    for (const s of slots.filter(x => MILITARES.indexOf(x.gid) >= 0)) {
      await dormir(azar(300, 700));
      const e = await traer(urlEdificio(did, s.aid, s.gid));
      const filas = filasDeTropa(e).map(x => ({ t: x.t, u: x.u, nombre: x.nombre }));
      await bg({ tipo: 'unidadesDe', clave: did + '|' + s.gid, filas });
      INFO.unidades = Object.assign({}, INFO.unidades || {}, { [did + '|' + s.gid]: filas });
    }
    log('TO DO: miré los edificios de ' + nombreDe(did));
  }

  async function pasoLista(info) {
    const c = CFG.lista || {};
    const P = TB_LISTA.parsear(c.texto || '', info.aldeas || []);
    const dids = (info.aldeas || []).map(a => String(a.did)).filter(d => P.porAldea[d] && P.porAldea[d].ordenes.length);
    if (!dids.length) {
      if (ss.get('tb_lvacia') !== '1') { ss.set('tb_lvacia', '1'); log('TO DO: la lista está vacía — escribila en el panel'); }
      const ms = await programarEn(ahora() + 60000);
      estado({ txt: 'lista vacía', next: ahora() + ms });
      return;
    }
    ss.del('tb_lvacia');
    cancelarRecarga();
    SYNC_RONDA = false;
    const H = Math.max(1, num(c.caballosHoras) || 2) * 3600;
    const ctx = { espera: ss.json('tb_lespera', {}), est: {}, ultFiestas: num(ss.get('tb_lfiestas')), fiestaAntes: ss.json('tb_lfiestaest', {}),
                  pedidos: ss.json('tb_lpedidos', {}), cereal: {}, rojas: ss.json('tb_lrojas', {}), reservas: {} };
    Object.keys(ctx.pedidos).forEach(k => { if (ahora() - ctx.pedidos[k].t > 4 * 3600000) delete ctx.pedidos[k]; });
    const sumar = (did, t) => { if (t) ctx.est[did] = (ctx.est[did] ? ctx.est[did] + ' · ' : '') + t; };
    try {
      // 0 · aldeas sin datos, o con una unidad pedida que no aparece (¿recién investigada?)
      for (const did of dids) {
        const ord = P.porAldea[did].ordenes;
        const sinDatos = !(INFO.edificios || {})[did];
        const plan = TB_LISTA.planTropas(ord, INFO.unidades || {}, did);
        if (sinDatos || plan.faltan.length) { bg({ tipo: 'trabajando', rol: ROL }); await escanearAldeaFetch(did); }
      }
      // 0b · rescate de cereal: lo primero (si una aldea roja llega al 5 %, se mueren las tropas)
      try { await rescateCereal(ctx); }
      catch (e) { if (e && e.parar) throw e; log('cereal: ' + (e && e.message ? e.message : e)); }
      // 1 · colas de entrenamiento de todas las aldeas (una página)
      const conTropas = dids.filter(d => P.porAldea[d].ordenes.some(o => o.tipo === 'tropas'));
      let colas = null;
      if (conTropas.length) {
        try { colas = await colasEntrenamiento(); } catch (e) {}
        if (!colas) log('TO DO: no pude leer las colas de entrenamiento (esta vuelta sin recursos del héroe)');
      }
      // 2 · aldea por aldea: establo → obras → hospital → resto de las tropas
      for (const did of dids) {
        const ord = P.porAldea[did].ordenes;
        bg({ tipo: 'trabajando', rol: ROL });
        estado({ txt: 'TO DO · ' + nombreDe(did) });
        try {
          /* cereal negativo (en rojo en la tabla de depósitos) y el granero al
             1 % o menos: NO entrena (cada tropa nueva come más cereal). Arriba
             del 1 % las rojas entrenan igual (pedido del 29/09; el rescate ya
             sube el granero al 15 % cuando baja del 5 %). */
          const roja = ctx.rojas[did] != null && ctx.rojas[did] <= 1;
          const tieneTropas = ord.some(o => o.tipo === 'tropas');
          if (roja && tieneTropas) sumar(did, 'tropas en pausa: cereal al ' + ctx.rojas[did] + '%');
          /* PRIORIDAD ("!" en la lista, pedido del 30/09): la obra va antes que el
             establo, y mientras no esté cumplida las tropas sólo usan lo que
             sobra por encima del costo de su próximo nivel (sin héroe ni NPC). */
          const conPrio = ord.some(o => o.prio && (o.tipo === 'edificio' || o.tipo === 'campos'));
          let obra = conPrio ? await obrasLista(did, ord, ctx) : null;
          const reserva = (obra && obra.reserva) || null;
          if (reserva) ctx.reservas[did] = reserva;
          const caballos = roja ? null : await tropasLista(did, ord, colas, H, 'caballos', false, reserva);
          sumar(did, caballos);
          if (!conPrio) obra = await obrasLista(did, ord, ctx);
          if (obra) sumar(did, obra.txt);
          if (ord.some(o => o.tipo === 'hospital')) sumar(did, await curarHospital(did));
          if (!caballos && !roja) sumar(did, await tropasLista(did, ord, colas, H, 'resto', !(obra && obra.pendientes), reserva));
        } catch (e) {
          if (e && e.parar) throw e;
          // un pedido que falla (red, PC cargada) no corta la vuelta: sigo con la próxima aldea
          sumar(did, '⚠ ' + (e && e.message ? e.message : e));
          log('TO DO · ' + nombreDe(did) + ': ' + (e && e.message ? e.message : e));
        }
        await dormir(azar(400, 1000));
      }
      // 3 · fiestas (cada 4 min)
      await fiestasLista(P, ctx);
    } catch (e) {
      if (e && e.parar) { cancelarRecarga(); await bg({ tipo: 'alarma', m: e.parar }); marcar('⛔ ' + e.message, false, 0); return; }
      log('TO DO: ' + (e && e.message ? e.message : e));
    }
    Object.keys(ctx.cereal).forEach(did => { if (ctx.cereal[did]) sumar(did, ctx.cereal[did]); });
    ss.set('tb_lespera', JSON.stringify(ctx.espera));
    ss.set('tb_lpedidos', JSON.stringify(ctx.pedidos));
    ss.set('tb_lrojas', JSON.stringify(ctx.rojas));
    ss.set('tb_lfiestas', String(ctx.ultFiestas || 0));
    ss.set('tb_lfiestaest', JSON.stringify(ctx.fiestaAntes || {}));
    await bg({ tipo: 'listaEstado', est: ctx.est, dids });
    /* la próxima vuelta arranca con la página recargada: con "sinRecarga" el
       meta refresh de respaldo (sacar el <meta> no lo cancela en Chrome)
       recargaba la pestaña EN MEDIO de la vuelta siguiente → "Failed to fetch" */
    const ms = await programarEn(T_INICIO + sortear(c.cada, [60, 90]));
    estado({ txt: 'vuelta lista (' + dids.length + ' aldeas)', next: ahora() + ms, ult: hhmm(ahora()) });
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
    // las aldeas salen del recuadro de la derecha: nuevas entran, perdidas salen
    if (!aldeasMiradas) { aldeasMiradas = true; try { await sincronizarAldeas(document); } catch (e) {} }

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
      else if (ROL === 'lista')    await pasoLista(info);
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
  arrancarBucle();
})();

})();
