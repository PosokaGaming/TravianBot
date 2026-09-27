# TravianBot

Bot para **Travian Legends** que corre en tu navegador con **Tampermonkey**.
Manda las farm lists, entrena tropas donde más falta hace, lleva al héroe de
aventura y sube campos y edificios. Tiene **modos** para dedicarse a una sola
cosa.

> ⚠️ **Usalo bajo tu responsabilidad.** Las reglas de Travian prohíben los bots
> y el uso de scripts puede terminar en la suspensión de la cuenta. Este
> proyecto es para aprender cómo funciona el juego por dentro.

## Instalar

1. Instalá la extensión [Tampermonkey](https://www.tampermonkey.net/) en tu
   navegador.
2. Abrí **[TravianBot.user.js](../../raw/main/TravianBot.user.js)** y tocá
   **Instalar** en la pantalla de Tampermonkey.
3. Entrá a tu Travian con la sesión iniciada. Abajo a la derecha aparece el
   botón verde **TB**: ahí está el panel.

### Actualizaciones automáticas

El script trae `@updateURL` apuntando a este repo. Tampermonkey revisa una vez
por día (se puede cambiar en su configuración, o forzar con *Buscar
actualizaciones*) y, si hay un `@version` más nuevo, se actualiza solo.

## Usar

1. Abrí el panel (**TB**) y tocá **▶ ARRANCAR**. La primera vez escanea tus
   aldeas, cuarteles, establos, talleres y herrerías (tarda un par de minutos).
2. Elegí el **MODO** arriba del panel:
   - **TROPAS**: se dedica a entrenar tropas.
   - **FARM**: se dedica a la farm list.
   - **CONSTRUCCIÓN**: sube campos y edificios.
   - **TODO**: hace todo por turnos.

   En cualquier modo, la **farm list** y el **héroe** siguen de fondo si están
   tildados.
3. Configurá cada tarjeta:
   - **Tropas**: qué unidad entrenar en cada edificio de cada aldea y cuántas
     por pasada (mínimo–máximo, o *max*).
   - **Farm list**: todas las listas o sólo algunas.
   - **Héroe**: salud mínima para mandarlo y qué aventura elegir.
   - **Construcción**: por aldea, campos hasta qué nivel, edificios a subir,
     mejoras de herrería, intercambio NPC y terminar con oro (estos dos
     cuestan oro y vienen apagados).

**Dejá abierta una pestaña de Travian.** El bot trabaja en una sola pestaña;
si abrís más, sólo una manda y las otras no hacen nada. Conviene desactivar el
ahorro de memoria de Chrome para Travian (`chrome://settings/performance`),
porque si Chrome congela la pestaña el bot se detiene.

## Cómo trabaja

- **Farm list**: hace lo mismo que el botón *Start all farm lists*: lee las
  listas y sus objetivos activos y manda cada lista con la API del juego
  (`POST /api/v1/farm-list/send`), sin cargar la página. Cada ~69 s.
- **Tropas por prioridad de cola**: cada vuelta lee los tiempos de
  `/village/statistics/troops/training` (todas las aldeas en una página) y
  entra a **un solo edificio por aldea**, el de menos cola o vacío, empezando
  por la aldea más vacía. Entra como una persona: clic en la aldea en la lista
  de la derecha y clic en el ícono verde del edificio. Saltea las colas de más
  de 3 h; si todas pasan, el límite sube a 6, 9… hasta 24 h.
- **Héroe**: lee la salud en `/hero/attributes` y lo manda a la primera
  aventura disponible. Si el héroe murió, avisa: revivirlo lo decidís vos.
- **Construcción**: una aldea por vuelta; sube el campo de menor nivel y los
  edificios elegidos cuando el botón está en verde.

### Protecciones

- Si aparece un captcha / control antibot, o la sesión se cierra, **se
  detiene** y lo avisa en el panel.
- **Freno de bucles**: si pide la misma página 5 veces en un minuto sin
  llegar, espera 5 minutos.
- Antes de actuar en una aldea verifica que sea la aldea activa, por si estás
  jugando al mismo tiempo en otra pestaña.

## Si algo falla

En el panel: **copiar diagnóstico** guarda la URL, la aldea y un pedazo del
HTML de la última falla. Pegalo en un [issue](../../issues) junto con el log
del panel.

## Para desarrollar

```
extension/              la versión extensión de Chrome (MV3) y el código compartido
  content.js            el bot (lectores de página, tropas, héroe, farm, construcción)
  panel.html/.css/.js   el panel
  background.js         service worker (sólo para la extensión)
src/userscript/
  nucleo.js             reemplaza al service worker dentro de la página
  panel-shell.js        el panel flotante (shadow DOM)
tools/build_userscript.py   arma TravianBot.user.js con todo lo anterior
```

1. Cambiá el código en `extension/` o `src/userscript/`.
2. Subí `"version"` en `extension/manifest.json` (Tampermonkey sólo actualiza
   si la versión es mayor).
3. `python tools/build_userscript.py` → regenera `TravianBot.user.js`.
4. Commit y push: los usuarios reciben la actualización.

La extensión de Chrome se instala con *Cargar descomprimida* sobre la carpeta
`extension/` (ver `extension/LEEME.md`). No uses la extensión y el userscript
al mismo tiempo.

## Licencia

MIT — ver [LICENSE](LICENSE).
