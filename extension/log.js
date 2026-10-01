/*  Travian Bot · página de log (pedido del 30/09: "implementar LOG al bot para
 *  ver qué hace"). Muestra el estado de cada aldea de la TO DO LIST y el log
 *  completo (el service worker guarda hasta 1.500 líneas), con filtro, y se
 *  actualiza sola cada 5 s. Se abre desde el panel: "📜 log completo".
 */
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const hora = t => { const d = new Date(t); const p = n => String(n).padStart(2, '0'); return p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds()); };
const QUIEN = { lista: 'TO DO', tropas: 'Tropas', heroe: 'Héroe', farm: 'Farm', recursos: 'Constr.', fondo: 'bot' };
const RX_ACCION = /⬆|💱|🚚|🌾 rescate|🎉|🏗|héroe →|✔/;
const RX_PROBLEMA = /⚠|⛔|falló|Failed|error|no pude|no dejó|sin oro|DETENIDO|antibot|Sesión|otra cuenta/i;
let pausado = false;

function clase(m) {
  if (/^vuelta TO DO/.test(m)) return 'resumen';
  if (RX_PROBLEMA.test(m)) return /⚠|aviso/.test(m) && !/falló|Failed|error/i.test(m) ? 'aviso' : 'error';
  if (RX_ACCION.test(m)) return 'accion';
  return '';
}

async function refrescar() {
  if (pausado) return;
  let r;
  try { r = await chrome.runtime.sendMessage({ tipo: 'verLog' }); } catch (e) { $('pie').textContent = 'no contesta el bot: ' + e.message; return; }
  if (!r) return;
  $('estado').textContent = r.run ? '▶ andando' : '■ detenido';
  $('estado').className = 'estado ' + (r.run ? 'on' : 'off');
  const aldeas = r.aldeas || [];
  $('cuenta').textContent = aldeas.length + ' aldeas en esta cuenta' + (r.modo ? ' · MODO ' + String(r.modo).toUpperCase() : '') + (r.estadoLista && r.estadoLista.txt ? ' · ahora: ' + r.estadoLista.txt : '');
  // cada aldea, en el orden de la cuenta
  const est = r.listaEstado || {};
  const ahora = Date.now();
  $('aldeas').innerHTML = aldeas.filter(a => est[a.did]).map(a => {
    const e = est[a.did];
    return '<tr class="' + (ahora - e.t > 15 * 60000 ? 'viejo' : '') + '"><td class="a">' + esc(a.nombre) + '</td><td class="h">' + hora(e.t) + '</td><td>' + esc(e.txt) + '</td></tr>';
  }).join('') || '<tr><td colspan="3">todavía no hay estado (la primera vuelta tarda un par de minutos)</td></tr>';
  // log, lo último arriba
  const f = $('filtro').value.trim().toLowerCase();
  const tipo = $('tipo').value;
  const lineas = (r.log || []).slice().reverse().filter(e => {
    const m = String(e.m);
    if (f && m.toLowerCase().indexOf(f) < 0) return false;
    if (tipo === 'acciones' && !RX_ACCION.test(m)) return false;
    if (tipo === 'problemas' && !RX_PROBLEMA.test(m)) return false;
    return true;
  });
  $('log').innerHTML = lineas.slice(0, 600).map(e =>
    '<tr class="' + clase(String(e.m)) + '"><td class="h">' + hora(e.t) + '</td><td class="r">' + esc(QUIEN[e.r] || e.r) + '</td><td class="m">' + esc(e.m) + '</td></tr>').join('');
  $('pie').textContent = lineas.length + ' líneas' + (lineas.length > 600 ? ' (muestro las 600 últimas)' : '') + ' · de ' + (r.log || []).length + ' guardadas · actualizado ' + hora(Date.now());
}

$('pausa').onclick = () => { pausado = !pausado; $('pausa').textContent = pausado ? 'seguir' : 'pausar'; if (!pausado) refrescar(); };
$('filtro').oninput = () => { const p = pausado; pausado = false; refrescar(); pausado = p; };
$('tipo').onchange = $('filtro').oninput;
refrescar();
setInterval(refrescar, 5000);
