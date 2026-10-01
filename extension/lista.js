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
    4: ['cereal', 'granja', 'trigo', 'crop', 'cropland', 'cropfield', 'crop field', 'campo de cereal', 'campos de cereal'],
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
  // "fiestas chicas", "small parties", "parties small": el tamaño puede ir antes o después
  const RX_FIESTA = /^((?:chicas?|pequenas?|small|little)\s+)?(fiestas?|parties|party|celebraciones?|celebrations?|keep parties going)\b(.*)$/;
  const RX_HOSP = /^(curar( el)? hospital|clear hospital|vaciar( el)? hospital|curar heridos|curar|heal|hospital)$/;
  /* recursos del héroe por aldea (pedido del 30/09, otra cuenta: "Don't use Hero
     resources except of 15 and 16"): "hero" = esta aldea los usa (también para
     obras); "no hero" = nunca. Ver heroeEn(). */
  const RX_HEROE = /^(?:(?:use|usar)\s+)?(?:the\s+)?(?:hero|heroe)(?:\s+(?:resources?|ressources?|recursos|res))?$|^(?:usar\s+)?(?:los\s+)?recursos del heroe$/;
  const RX_HEROE_NO = /^(?:no|sin|without|dont use|do not use|never|nunca)\s+(?:the\s+|los\s+)?(?:hero|heroe|recursos del heroe)(?:\s+(?:resources?|ressources?|recursos|res))?$/;

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
    /* "npc" en una obra (pedido del 30/09, otra cuenta: "NPC there for 1 Cropfield
       to 18 when the resources are enough"): cuando el TOTAL de la aldea alcanza,
       NPC al costo exacto y la sube. "1 crop 18" = UN solo campo (el más alto). */
    let npc = false;
    if (RX_NPC.test(t)) { npc = true; t = t.replace(RX_NPC_G, ' ').replace(/\s+/g, ' ').trim(); }
    let o = null;
    const mu = t.match(/^(?:1|one|un|una|uno|single)\s+(.+)$/);
    if (mu) { const ou = ordenSuelta(mu[1], texto); if (ou && ou.tipo === 'campos') { ou.uno = true; o = ou; } }
    if (!o) o = ordenSuelta(t, texto);
    if (o && prio && (o.tipo === 'edificio' || o.tipo === 'campos')) o.prio = true;
    if (npc && !o) return { error: '"npc" sólo va con una obra o un campo ("' + texto.trim() + '")' };
    if (o && npc) {
      if (o.tipo === 'edificio' || o.tipo === 'campos') o.npc = true;
      else if (!o.error) return { error: '"npc" sólo va con una obra o un campo ("' + texto.trim() + '")' };
    }
    return o;
  }
  const RX_NPC = /(^|\s)(?:(?:con|with)\s+)?npc(?=\s|$)/;
  const RX_NPC_G = /(^|\s)(?:(?:con|with)\s+)?npc(?=\s|$)/g;
  /* abastecer (pedido del 30/09, otra cuenta): "supply 2" en la línea de la aldea
     10 = cuando SU granero llega al 95 % (o "supply 2 at 90"), NPC a 1/3 madera,
     1/3 barro, 1/3 hierro y le manda a 2, con comerciantes, sólo lo que le falta
     para su próxima obra (sin desbordar su depósito). */
  const RX_ABASTECER = /^(?:supply|abastecer|feed|alimentar|send to|send|enviar a|enviar|mandar a|mandar)\s+(.+?)(?:\s+(?:at|al|a|desde|from)\s+(\d{1,3}))?$/;

  /* una orden suelta (ya normalizada) → objeto, o { error } */
  function ordenSuelta(t, texto) {
    if (!t) return null;
    const f = t.match(RX_FIESTA);
    if (f) return { tipo: 'fiestas', grande: !f[1] && !/\b(chicas?|pequenas?|small|little)\b/.test(f[3]), txt: texto.trim() };
    if (RX_HOSP.test(t)) return { tipo: 'hospital', txt: texto.trim() };
    if (/^nada$|^nothing$/.test(t)) return { tipo: 'nada', txt: texto.trim() };
    if (RX_HEROE_NO.test(t)) return { tipo: 'heroe', si: false, txt: texto.trim() };
    if (RX_HEROE.test(t)) return { tipo: 'heroe', si: true, txt: texto.trim() };
    const ab = t.match(RX_ABASTECER);
    if (ab) {
      const pct = ab[2] ? parseInt(ab[2], 10) : 95;
      if (pct < 10 || pct > 100) return { error: 'el granero va de 10 a 100 % ("' + texto.trim() + '")' };
      return { tipo: 'abastecer', a: ab[1].trim(), granero: pct, txt: texto.trim() };
    }

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
    let actuales = [], general = false;   // general = la línea es "todas:" (una línea de la aldea le gana)
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
        general = /^(todas|todos|all|every)$/.test(norm(cab));
        resto = linea.slice(dp + 1);
      } else if (!actuales.length) {
        errores.push({ linea: i + 1, msg: 'falta la aldea al principio ("04T: …")' });
        return;
      }
      resto.split(/\s*[,;]\s*/).forEach(pedazo => {
        const o = orden(pedazo);
        if (!o) return;
        if (o.error) { errores.push({ linea: i + 1, msg: o.error }); return; }
        if (o.tipo === 'abastecer') {   // la aldea destino se resuelve acá (tiene que ser UNA)
          const r = buscarAldea(o.a, aldeas);
          if (r.length !== 1) { errores.push({ linea: i + 1, msg: 'no conozco la aldea destino "' + o.a + '"' }); return; }
          o.destino = r[0];
          o.destinoNombre = (aldeas.find(a => String(a.did) === r[0]) || {}).nombre || o.a;
        }
        if (general) o.general = true;
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
    return (o.prio ? '⚑ PRIORIDAD · ' : '') + describirBase(o) + (o.npc ? ' (con NPC cuando el total alcanza)' : '');
  }
  function describirBase(o) {
    if (o.tipo === 'campos') {
      const que = o.tipos.length === 4 ? 'campos' : o.tipos.map(k => ({ 1: 'madera', 2: 'barro', 3: 'hierro', 4: 'cereal' }[k])).join('+');
      return (o.uno ? 'UN campo de ' : '') + que + (o.uno ? ' (el más alto)' : '') + (o.max >= 99 ? ' hasta el máximo' : ' → ' + o.max);
    }
    if (o.tipo === 'abastecer') return 'granero ≥' + o.granero + ' % → NPC a ⅓ madera/barro/hierro → manda a ' + (o.destinoNombre || o.a) + ' lo que le falta';
    if (o.tipo === 'edificio') return (o.gid ? NOMBRE_ES[o.gid] : 'Muralla') + ' → ' + o.max;
    if (o.tipo === 'tropas') return 'tropas: ' + o.grupos.map(g => g.map(titulo).join(' / ')).join(' + ');
    if (o.tipo === 'hospital') return 'curar el hospital';
    if (o.tipo === 'heroe') return o.si ? 'usa los recursos del héroe (también en obras)' : 'sin recursos del héroe';
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

  /* ¿los recursos del héroe se usan en esta aldea? (pedido del 30/09)
     · "hero" / "no hero" en la línea de la aldea mandan (le ganan a "todas:")
     · si ALGUNA aldea tiene "hero", el héroe se usa SÓLO en esas
     · true = sí, incluso para obras · false = nunca (ni el rescate de cereal)
     · null = la lista no dice nada: decide el tilde del panel (establo y rescate) */
  function heroeEn(P, did) {
    const ords = ((P && P.porAldea[String(did)]) || { ordenes: [] }).ordenes.filter(o => o.tipo === 'heroe');
    const propias = ords.filter(o => !o.general);
    const manda = (propias.length ? propias : ords).slice(-1)[0];
    if (manda) return manda.si;
    const hayBlanca = !!P && Object.keys(P.porAldea).some(d => P.porAldea[d].ordenes.some(o => o.tipo === 'heroe' && o.si));
    return hayBlanca ? false : null;
  }

  return { parsear, describir, planTropas, elegirDelGrupo, coincide, norm, heroeEn, NOMBRE_ES, GIDS_MURALLA };
})();
