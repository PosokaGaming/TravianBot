# TravianBot

Bot para **Travian Legends** que corre en tu navegador con **Tampermonkey**.
Manda las farm lists, entrena tropas donde más falta hace, lleva al héroe de
aventura y sube campos y edificios. Tiene **modos** para dedicarse a una sola
cosa.

> ⚠️ **Usalo bajo tu responsabilidad.** Las reglas de Travian prohíben los bots
> y el uso de scripts puede terminar en la suspensión de la cuenta. Este
> proyecto es para aprender cómo funciona el juego por dentro.

## Instalar

Hay dos formas. **Usá una sola**, nunca las dos juntas.

**A · Tampermonkey (recomendada: se actualiza sola)**

1. Instalá la extensión [Tampermonkey](https://www.tampermonkey.net/) en tu
   navegador. En Chrome, en la tarjeta de Tampermonkey
   (`chrome://extensions` → Detalles) prendé **Permitir scripts de usuario**.
2. Abrí **[TravianBot.user.js](../../raw/main/TravianBot.user.js)** y tocá
   **Instalar** en la pantalla de Tampermonkey.
3. Entrá a tu Travian con la sesión iniciada. Abajo a la derecha aparece el
   botón verde **TB**: ahí está el panel.

**B · Extensión de Chrome (zip)**

1. Bajá `TravianBot-extension-<versión>.zip` (de *Releases* o el que te
   pasaron) y descomprimilo: queda una carpeta `TravianBot`.
2. `chrome://extensions` → prendé **Modo de desarrollador** → **Cargar
   descomprimida** → elegí esa carpeta. No la borres ni la muevas después.
3. Con Travian abierto: ícono de la extensión → **▶ ARRANCAR**.

Para actualizar la extensión: reemplazá el contenido de la carpeta por el del
zip nuevo y tocá ↻ en su tarjeta de `chrome://extensions` (la configuración y
la lista se conservan).

La primera vez el bot arranca **detenido** y con el NPC con
oro **apagado**: nada gasta oro hasta que lo tildes vos.

### Actualizaciones automáticas

El script trae `@updateURL` apuntando a este repo. Tampermonkey revisa una vez
por día (se puede cambiar en su configuración, o forzar con *Buscar
actualizaciones*) y, si hay un `@version` más nuevo, se actualiza solo.

## Usar

1. Abrí el panel (**TB**) y tocá **▶ ARRANCAR**. La primera vez escanea tus
   aldeas, cuarteles, establos, talleres y herrerías (tarda un par de minutos).
2. Elegí el **MODO** arriba del panel:
   - **TO DO LIST**: cada aldea hace sólo lo que dice tu lista (ver abajo).
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

## TO DO LIST (v5.0, 29/09/2026)

Una lista por aldea, y **cada aldea hace sólo lo que dice**. La farm list sigue
de fondo (prioridad 1). Se usa con el **MODO TO DO LIST** y trabaja con **una
sola pestaña** que no carga páginas: todo sale por pedidos directos al juego.

```
00: campos                          # campos hasta el máximo
04T: Warehouse 20, Tournament Square 17, hospital, tropas Clubswinger + Teutonic Knight
07: tropas Marauder/Steppe Rider    # la primera que esté investigada
010: campos 10, tropas Clubswinger + Teutonic Knight
todas: fiestas                      # grande si se puede, si no chica
```

| orden | qué hace |
|---|---|
| `campos 10` / `madera 12` | sube los campos (el de menor nivel en verde); sin número, hasta el máximo |
| `Warehouse 20` / `Almacén 20` | sube **todas** las copias de ese edificio hasta el nivel (inglés o castellano) |
| `!Tournament Square 10` | **PRIORIDAD** (también `prioridad …` o `… primero`): ver abajo |
| `cereal` | sólo campos de cereal (lo mismo `madera`, `barro`, `hierro`) |
| `tropas A + B` | entrena sin parar; `A/B` = A, y si no está investigada, B |
| `hospital` | cura a los heridos con lo que alcance |
| `fiestas` / `fiestas chicas` | fiesta grande donde el ayuntamiento y los recursos lo permitan, si no chica |
| `todas:` · `nada` · `#` | para todas las aldeas · esa aldea quieta · comentario |

**Prioridad dentro de cada aldea**: 1) el establo hasta tener 2 h de cola
(configurable), completando con los **recursos del héroe** lo que falte;
2) las obras; 3) el hospital; 4) cuartel y taller hasta 2 h. Si la aldea no
tiene obras pendientes, las colas siguen creciendo de a 2 h (hasta 24 h).

**PRIORIDAD** (`!` delante de una obra, v5.3, 30/09/2026): esa obra va **antes
que el establo** y, mientras no esté cumplida, las tropas de la aldea sólo usan
lo que sobra por encima del costo de su próximo nivel (🔒 en el estado); esa
aldea no recibe recursos del héroe ni NPC para tropas, y la fiesta espera si se
comería la reserva. Si el edificio **no existe**, el bot lo **construye** en una
casilla libre (si no hay ninguna, lo avisa y las tropas siguen normal). Si le
faltan requisitos, tampoco reserva nada.

**NPC con oro** (viene **apagado**: se tilda en el panel; tope de NPC por día, 30):
sólo cuando sirve para algo grande. En tropas, si con el NPC la cola llega a
llenar **1 h o más** (y 30 min más que sin NPC); en el establo antes le pasa del
héroe lo que falte en total (el hierro y el cereal que sobran). En obras, si el
obrero está libre, faltaba **1 h o más** para tener los recursos, la obra cuesta
2.000 o más y el total de la aldea alcanza. Cada NPC cuesta 3 de oro.

**Rescate de cereal** (automático, en cada vuelta): en las aldeas con cereal
negativo (en rojo en *Statistics → Resources → Warehouse*), cuando el granero
baja al **5 %** (o le quedan 10 min o menos) lo sube al **15 %**. Primero con el
cereal del héroe (que no se usa para nada más); si no alcanza, un NPC que pasa
lo demás a cereal (sólo con el NPC tildado). Ese NPC no cuenta para el tope del día. Además, ningún NPC de
tropas u obras baja el cereal de lo que había (hasta el 15 % del granero).

La lista se escribe en la tarjeta **TO DO LIST** del panel (guardar o
Ctrl+Enter); debajo muestra cómo entendió cada línea y qué está haciendo cada
aldea. En la extensión también se puede dejar en `extension/todo.txt`: cuando
el archivo cambia, el bot lo toma solo (el archivo no va al repo).

Las aldeas se leen de la lista de la derecha en cada vuelta: las nuevas entran
y las perdidas salen solas (si faltan más de 2 de golpe no borra nada, por si
la lista venía filtrada por un grupo).

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
