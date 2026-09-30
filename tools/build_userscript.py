"""Arma TravianBot.user.js (Tampermonkey) con el MISMO código de la extensión.

    python tools/build_userscript.py

- La versión sale de extension/manifest.json ("version"): subila ahí en cada
  cambio. Tampermonkey sólo actualiza si @version es mayor que la instalada.
- @updateURL / @downloadURL apuntan al archivo "raw" de GitHub, sacado del
  remote "origin" del repo (o de --repo usuario/TravianBot).
- Partes: núcleo (reemplaza al service worker) + carcasa del panel +
  panel.js y content.js de la extensión, con cuatro retoques de texto.
"""
import json
import pathlib
import re
import subprocess
import sys

RAIZ = pathlib.Path(__file__).resolve().parent.parent
EXT = RAIZ / 'extension'
SRC = RAIZ / 'src' / 'userscript'
SALIDA = RAIZ / 'TravianBot.user.js'


def leer(p):
    return (p).read_text(encoding='utf-8')


def cambiar(texto, viejo, nuevo, que, regex=False):
    """Reemplaza una sola vez y avisa fuerte si el original cambió."""
    if regex:
        nuevo_texto, n = re.subn(viejo, lambda m: nuevo, texto, count=1, flags=re.S)
    else:
        n = texto.count(viejo)
        nuevo_texto = texto.replace(viejo, nuevo, 1)
    if n < 1:
        sys.exit('ERROR: no encontré en %s el trozo a reemplazar. Revisá el build.' % que)
    return nuevo_texto


def repo_de_git():
    for a in sys.argv[1:]:
        if a.startswith('--repo='):
            return a.split('=', 1)[1]
    try:
        url = subprocess.check_output(['git', '-C', str(RAIZ), 'remote', 'get-url', 'origin'], text=True).strip()
    except Exception:
        return None
    m = re.search(r'github\.com[:/]([^/]+/[^/.]+)', url)
    return m.group(1) if m else None


def main():
    manifest = json.loads(leer(EXT / 'manifest.json'))
    version = manifest['version']
    matches = manifest['content_scripts'][0]['matches']
    repo = repo_de_git()
    if repo:
        raw = 'https://raw.githubusercontent.com/%s/main/TravianBot.user.js' % repo
    else:
        raw = None
        print('AVISO: sin remote de GitHub todavía: el script sale SIN @updateURL (no se va a actualizar solo).')

    cab = ['// ==UserScript==',
           '// @name         TravianBot',
           '// @namespace    https://github.com/%s' % (repo or 'TravianBot'),
           '// @version      %s' % version,
           '// @description  Bot para Travian Legends: TO DO LIST por aldea, farm list, tropas por prioridad de cola, héroe y construcción, con modos. Una sola pestaña.',
           '// @author       TravianBot']
    cab += ['// @match        %s' % m for m in matches]
    cab += ['// @grant        GM_getValue',
            '// @grant        GM_setValue',
            '// @grant        GM_registerMenuCommand',
            '// @run-at       document-end',
            '// @noframes']
    if raw:
        cab += ['// @updateURL    ' + raw, '// @downloadURL  ' + raw,
                '// @homepageURL  https://github.com/%s' % repo,
                '// @supportURL   https://github.com/%s/issues' % repo]
    cab += ['// ==/UserScript==', '']

    # ── content.js: el bot. Sólo cambia cómo habla con el "service worker". ──
    content = leer(EXT / 'content.js')
    content = cambiar(content, r"const bg = msg => new Promise\(res => \{.*?\n  \}\);", 'const bg = TB.bg;   // userscript: el núcleo atiende en la misma página',
                      'content.js (bg)', regex=True)
    content = cambiar(content, r"if \(/travian/i\.test\(location\.hostname\)\) arrancarBucle\(\);.*?\n  \}\n", 'arrancarBucle();\n',
                      'content.js (arranque)', regex=True)

    # ── panel.js: mismo panel, dentro de una función que recibe el shadow root como `document` ──
    panel = leer(EXT / 'panel.js')
    panel = cambiar(panel, r"const bg   = msg => new Promise\(res => chrome\.runtime\.sendMessage.*?\n", '', 'panel.js (bg)', regex=True)
    panel = cambiar(panel, r"async function origenActivo\(\) \{.*?\n\}\n", 'async function origenActivo() { return location.origin; }\n',
                    'panel.js (origenActivo)', regex=True)
    panel = cambiar(panel, 'setInterval(() => refrescar(false), 1000);',
                    'setInterval(() => { if (TB_PANEL.abierto()) refrescar(false); }, 1000);', 'panel.js (refresco)')

    html = leer(EXT / 'panel.html')
    cuerpo = re.search(r'<body>(.*?)<script', html, re.S).group(1).strip()
    css = leer(EXT / 'panel.css').replace('body {', '.tbp {', 1)
    css += ('\n.tbp{width:420px;max-height:80vh;overflow-y:auto;border:1px solid #3a3a40;border-radius:8px;'
            'box-shadow:0 8px 28px rgba(0,0,0,.55)}\n'
            '[data-abrir],.acciones .chk{display:none}\n.cerrar{margin-left:6px}\n')

    partes = [
        '\n'.join(cab),
        '/* Archivo GENERADO por tools/build_userscript.py — no editar a mano: los',
        '   cambios van en extension/ (content.js, panel.*) o en src/userscript/. */',
        '(function () {',
        "'use strict';",
        'const TB_CSS = %s;' % json.dumps(css, ensure_ascii=False),
        'const TB_HTML = %s;' % json.dumps(cuerpo, ensure_ascii=False),
        leer(EXT / 'lista.js'),
        leer(SRC / 'nucleo.js'),
        leer(SRC / 'panel-shell.js'),
        'function panelMain(document, bg) {',
        panel,
        '}',
        content,
        '})();',
        '',
    ]
    SALIDA.write_text('\n'.join(partes), encoding='utf-8', newline='\n')
    print('OK: %s  v%s  (%d KB)%s' % (SALIDA.name, version, SALIDA.stat().st_size // 1024,
                                       '' if raw else '  [sin auto-actualización]'))
    if raw:
        print('Instalar / actualizar: ' + raw)


if __name__ == '__main__':
    main()
