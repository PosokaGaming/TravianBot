"""Arma el paquete para compartir el bot con otro jugador.

    python tools/empaquetar.py

Deja en dist/:
- TravianBot-extension-<versión>.zip: la carpeta de la extensión de Chrome,
  lista para descomprimir y "Cargar descomprimida". SIN todo.txt ni
  ajustes.json (son de tu cuenta: nombres de aldeas y ajustes propios).
- TravianBot.user.js: la versión Tampermonkey (regenerada antes de copiar).

La versión sale de extension/manifest.json, igual que en build_userscript.py.
"""
import json
import pathlib
import shutil
import subprocess
import sys
import zipfile

RAIZ = pathlib.Path(__file__).resolve().parent.parent
EXT = RAIZ / 'extension'
DIST = RAIZ / 'dist'
# de cada jugador: nunca van en el paquete (todo.txt, todo_<cuenta>.txt, ajustes.json)
PRIVADOS = {'todo.txt', 'ajustes.json'}
es_privado = lambda nombre: nombre in PRIVADOS or (nombre.startswith('todo') and nombre.endswith('.txt'))


def main():
    version = json.loads((EXT / 'manifest.json').read_text(encoding='utf-8'))['version']
    subprocess.check_call([sys.executable, str(RAIZ / 'tools' / 'build_userscript.py')] + sys.argv[1:])

    DIST.mkdir(exist_ok=True)
    for viejo in DIST.glob('TravianBot-extension-*.zip'):
        viejo.unlink()
    destino = DIST / ('TravianBot-extension-%s.zip' % version)
    archivos = sorted(p for p in EXT.rglob('*') if p.is_file() and not es_privado(p.name)
                      and '__pycache__' not in p.parts)
    with zipfile.ZipFile(destino, 'w', zipfile.ZIP_DEFLATED) as z:
        for p in archivos:
            # todo adentro de una carpeta "TravianBot": al descomprimir queda lista para cargar
            z.write(p, 'TravianBot/' + p.relative_to(EXT).as_posix())
    shutil.copy2(RAIZ / 'TravianBot.user.js', DIST / 'TravianBot.user.js')

    with zipfile.ZipFile(destino) as z:
        nombres = z.namelist()
    fuera = [n for n in nombres if es_privado(pathlib.PurePosixPath(n).name)]
    if fuera:
        sys.exit('ERROR: el zip lleva archivos privados: %s' % ', '.join(fuera))
    print('OK v%s: %s (%d archivos) + dist/TravianBot.user.js' % (version, destino.relative_to(RAIZ), len(nombres)))


if __name__ == '__main__':
    main()
