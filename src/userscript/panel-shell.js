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
