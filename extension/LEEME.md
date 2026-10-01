# TravianBot — versión extensión de Chrome

La misma lógica que el userscript, como extensión de Chrome: un **service
worker** es el dueño de las pestañas y cada tarea (Tropas, Héroe, Farm list,
Construcción) trabaja en su propia pestaña. Los selectores se verificaron a
mano en un servidor x5 de Travian Legends (septiembre de 2026).

> Para la mayoría conviene el **userscript** (`TravianBot.user.js` en la raíz
> del repo): se instala con un clic en Tampermonkey y se actualiza solo.
> Nunca uses los dos a la vez.

## Instalar (3 clics, una sola vez)

1. `chrome://extensions` → **Modo de desarrollador** activado
2. **Cargar descomprimida** → la carpeta `extension` del repo (o la carpeta
   `TravianBot` del zip que arma `python tools/empaquetar.py`)
3. Ya está. Cada vez que cambie el código: botón ↻ en la tarjeta de la extensión.

Chrome muestra un globo "Desactiva las extensiones en modo de desarrollador" al
abrir: cerralo. No borres ni muevas la carpeta.

## Usar

1. Abrí tu Travian con la sesión iniciada.
2. Ícono → **▶ ARRANCAR**. La **primera vez escanea solo** tus aldeas antes de
   hacer nada (unos 40 s: recorre todas tus aldeas, sus cuarteles, establos,
   talleres y herrerías).
3. Abrí el panel y configurá aldea por aldea. Minimizá.

Cuando fundes una aldea nueva o construyas un cuartel nuevo: **🔍 escanear
aldeas** de nuevo.

### Tropas
Desplegable de aldea (con su tribu — tus aldeas son de tribus distintas, así que
cada una entrena unidades diferentes). Por edificio: `revisar cada [60] a [90] s`
(rango, se sortea). Por unidad: `[5] a [10]` por pasada (sorteado) o `max`.

### Héroe
Lee la salud en `/hero/attributes` (la única página que la muestra como
número), la guarda 90 s y manda a la aventura más corta si supera el mínimo.

### Farm list
Manda cada lista con su botón "Start (N)"; las vacías se saltean. En tu versión
no existe "Start all". Podés elegir desde qué aldea se abre la página; las
listas son de la cuenta, así que normalmente da igual.

### Construcción (por aldea, desplegable)
- **Campos de recursos**: tildás madera/barro/hierro/cereal y hasta qué nivel.
  Sube siempre el campo de menor nivel que esté en verde.
- **Edificios**: lista real de la aldea con su nivel actual; tildás cuáles subir
  y hasta qué nivel. Abajo, **construir nuevo** para uno que no exista todavía
  (este paso no lo pude verificar en tu servidor: si falla, el log lo dice).
- **Herrería**: las unidades de esa aldea con su nivel de mejora; tildás cuáles
  subir y hasta cuánto. Una mejora por vuelta (cola de investigación).
- **⚠ Cuesta oro** (apagado por defecto):
  - *terminar las construcciones con oro*: clic en "Complete construction
    immediately" al final de cada vuelta.
  - *NPC cuando un depósito pase del N %*: abre "Exchange resources", reparte
    los 4 recursos en partes iguales (cereal hasta el 90 % del granero) y paga
    los 3 oro. Se hace a lo sumo una vez por aldea por vuelta.
- **Una aldea por vuelta**: rota entre las aldeas que tengan algo tildado.
  Con 9 aldeas son ~4 páginas por pasada en vez de 36.

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
| `1 crop 18` · `un cereal 18` | UN solo campo (el de nivel más alto) hasta ese nivel |
| `… npc` (ej. `1 crop 18 npc`) | cuando el TOTAL de la aldea alcanza el costo, NPC al costo exacto y la sube (no usa el tope diario; 1 NPC cada 10 min como mucho) |
| `supply 2` · `abastecer 2` (`supply 2 at 90`) | cuando el granero de ESTA aldea llega al 95 %: NPC a ⅓ madera, ⅓ barro, ⅓ hierro y le manda a 2, con comerciantes, sólo lo que le falta para su próxima obra (sin desbordar su depósito, tope 480.000) |
| `hero` · `no hero` | esa aldea usa los recursos del héroe, **también para obras** (si a la obra le falta y el héroe tiene todo lo que falta) · nunca. Si alguna aldea tiene `hero`, las demás no los usan (ni para el establo ni para el rescate de cereal). Sin `hero` en la lista, decide el tilde del panel |
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

### Cómo se hizo sin cargar páginas (verificado en rog.x5 el 29/09)
- **Tropas y hospital**: GET del edificio + POST de `form[name=snd]` (el
  hospital usa el mismo formulario, botón "Heal"). Costo por unidad en
  `.resourceWrapper i.rNBig`, tiempo por unidad en `.inlineIcon.duration`.
- **Obras**: el botón verde trae `window.location.href = '/dorf2.php?id=…&gid=…&action=build&checksum=…'`;
  se pide ese enlace. Sin recursos no hay botón verde y sí `.errorMessage`
  ("Enough resources on …").
- **Fiestas**: `/village/statistics/culturepoints`, columna *Celebrations*
  (tiempo = hay fiesta, `-` = sin ayuntamiento). Se piden con
  `build.php?id=…&gid=24&action=celebration&do=1|2&t=1` (1 chica, 2 grande).
- **Héroe**: `GET /api/v1/hero/v2/screen/inventory` (typeId 145-148 =
  madera/barro/hierro/cereal) y `hero/v2/inventory/use-item` en dos pasos
  (TwoStepAction): `PUT` con `{action:'inventory', itemId, amount, villageId}`
  devuelve `x-nonce`; el mismo cuerpo por `POST` con `X-Nonce`. Acepta
  cualquier aldea sin cambiar la activa.
- **NPC**: el botón "Redeem" del diálogo `marketplace/exchange-resources`
  llama a `Travian.Game.PremiumFeature.NpcTrader` → TwoStepAction
  `premium/npc-trader` con `{villageId, desired:{lumber,clay,iron,crop},
  action:'premiumFeature'}` (PUT → x-nonce → POST). 3 oro.
- **Costo de una obra**: `.upgradeBuilding i.r1Big..r4Big` (nivel siguiente) y
  `.errorMessage .timer[value]` = segundos hasta tener los recursos.

## Cómo evita pisarse con vos y consigo mismo

Travian tiene **una sola aldea activa por sesión** y las 4 pestañas comparten
tu sesión. Por eso:

- Cada navegación del bot lleva `newdid=` explícito.
- Antes de actuar en una aldea, la pestaña pide un **candado** al service
  worker (`tb_lock`, vence a los 90 s). Dos pestañas no cambian de aldea al
  mismo tiempo.
- La verdad de "en qué aldea estoy" es el nombre visible (`.villageInput`), no
  lo que el bot cree: si vos cambiaste de aldea en tu pestaña, el bot lo nota y
  vuelve a la suya.
- Efecto colateral inevitable: **el bot te va a cambiar la aldea activa** en tu
  pestaña cada vez que trabaje en otra. Es cómo funciona Travian.

## Cadencia
Meta refresh en cada pestaña + vigilante del service worker cada minuto.
Mientras trabaja, la pestaña toma un permiso de 60 s para que no la recarguen a
mitad de una ronda.

**Esperas sin cadena de timers**: `dormir()` salta por un `MessageChannel`
antes del `setTimeout`. Chrome frena a una vuelta por minuto los timers
encadenados de las pestañas ocultas hace más de 5 minutos: una pausa de medio
segundo llegaba a tardar 40 s y el bot parecía colgado.

**Con la PC cargada el bot va más lento, pero anda.** Chrome corre las
pestañas de fondo y el service worker con prioridad *Idle* / modo eficiencia
(en esta laptop, los 4 núcleos chicos). Si hay juegos o renders abiertos, cada
mensaje entre pestaña y service worker puede tardar 5-40 s. Por eso cada paso
guarda su avance ANTES de apretar un botón que recarga la página, y el service
worker guarda todo en memoria (no lee el disco en cada consulta).

## Cambios v5.8.3 (30/09/2026, 22:55) — "que suban sí o sí 15 y 16"

Con `hero` + `npc` en la misma línea: primero el héroe si tiene TODO lo que falta (sin oro); si no, el
héroe completa el TOTAL (de lo que más tenga, sin desbordar) y después NPC al costo exacto. El freno del
NPC exacto bajó a 1 cada 3 min por aldea (los campos bajos se terminan en segundos en x5).

## Cambios v5.8.2 (30/09/2026, 22:50) — sesión de cuidador (sitter)

Como cuidador el juego no dibuja `input.villageInput` (no se puede renombrar la aldea): el TO DO daba
"no pude entrar a la aldea" en todas. `didDe` y los chequeos de sesión ahora usan también
`.listEntry.village.active[data-did]`.

## Cambios v5.8.1 (30/09/2026, 22:35)

Al cambiar de cuenta, la pestaña reprogramaba su espera de 8 s en cada tick (el bucle corre 4 s antes
del NEXT) y el meta refresh no llegaba nunca: quedó trabada en "🔁 cambié de cuenta". Ahora el cambio se
resuelve en el tick siguiente sin recargar, y con una cuenta desconocida recarga UNA vez por minuto.

## Cambios v5.8 (30/09/2026) — otra cuenta: abastecer, NPC exacto y perfiles

- `supply 2`: granero de esta aldea ≥95 % → NPC ⅓/⅓/⅓ → manda a 2 lo que le falta (API del juego
  `PUT+POST /api/v1/marketplace/resources/send`, destino por coordenadas, sale de la aldea ACTIVA: se
  verifica por GraphQL antes de mandar; lo que va en camino se anota en `tb_lenvios`).
- `1 crop 18 npc`: un solo campo (el más alto) y NPC al costo exacto cuando el total alcanza.
- Perfiles por cuenta en el service worker (`tb_perfiles`, `CLAVES_CUENTA`): al aparecer otra cuenta
  conocida se guarda la que sale y se carga la que entra. `ajustes.json` → `"cuenta": {"nueva": true,
  "fichero": "todo_otra.txt", …}` adopta la próxima cuenta desconocida; `"arrancar": true` arranca.
  Cada perfil lee su archivo de lista (`lista.fichero`, por defecto todo.txt). `lista.rescateNpc` separa
  el NPC del rescate de cereal del NPC general.

## Cambios v5.7 (30/09/2026) — la sesión de otra cuenta

El 30/09 a las 21:28 se entró con otra cuenta del MISMO servidor en este perfil: el bot sumó sus 16
aldeas a las mías y siguió trabajando con esa sesión (con `todas: fiestas` y el rescate de cereal habría
gastado recursos y oro de la otra cuenta). Ahora `tb_cuenta` = las aldeas de la cuenta (la arma el
escaneo; si no hay, lo escaneado en `tb_edificios`). Si la página no comparte NINGUNA aldea con la
cuenta: `aldeasSync` responde `otraCuenta`, la pestaña espera (⏸) y la farm list por API no sale. Al
volver la cuenta, saca las aldeas ajenas que se habían mezclado. Escanear = cambiar de cuenta a propósito.

## Cambios v5.6 (30/09/2026) — pausa por página

Pedido: "que cambie de página cada 10 segundos" (saltaba de aldea en aldea y de edificio en edificio
en 1-2 s). `cfg.pausaPagina` (10 s de fábrica, campo arriba del panel): `irA`, `clic` y la recarga no
dejan la página antes de ese tiempo desde que cargó. Los fetch del TO DO LIST no cambian de página y no
esperan. El primer escaneo tarda más (≈10 s por página).

## Cambios v5.5 (30/09/2026) — recursos del héroe por aldea

Pedido para la otra cuenta: "Don't use Hero resources except of 15 and 16" → `15: fields 10, hero`.
`hero` en una línea = esa aldea usa el inventario del héroe también para obras (antes sólo el establo y el
rescate de cereal); si alguna aldea lo tiene, el héroe se usa SÓLO en esas. `no hero` = nunca. Sin `hero`
en la lista, todo sigue como antes (el tilde del panel).

## Cambios v5.4 (30/09/2026) — para compartir con otro jugador

- `python tools/empaquetar.py` arma `dist/TravianBot-extension-<versión>.zip`
  (sin `todo.txt` ni `ajustes.json`) y copia `TravianBot.user.js`.
- Instalación nueva: arranca detenida y con el **NPC con oro apagado** (antes
  una actualización le aplicaba los ajustes de mi cuenta y arrancaba sola).
- TO DO LIST: reconoce aldeas con **espacios** en el nombre ("Nueva aldea",
  "Capua 02") y con letras que no son latinas; separalas con coma.
- El rescate de cereal no hace NPC si el NPC está destildado.
- v5.4.1: `small parties` / `fiestas chicas` antes o después ("small parties" se tomaba como tropas).

## v4 (27/09/2026) — MODOS y rondas por edificio
- **MODO** (arriba en el panel): TROPAS · FARM · CONSTRUCCIÓN · TODO. El modo
  elegido usa las pestañas y la CPU; la farm list y el héroe siguen de fondo
  si están tildados; lo demás queda pausado y su pestaña se cierra.
- **Tropas por prioridad de cola** (v4.2, reemplazó a las rondas cuartel →
  establo → taller): cada vuelta lee /village/statistics/troops/training,
  entra a UN SOLO edificio por aldea (el de menos cola o vacío; v4.3) y
  empieza por la aldea cuyo edificio elegido tenga menos cola. Saltea los que tienen
  más de 3 h de cola; si todos pasan, el límite sube a 6, 9, … hasta 24 h.
  Pausa de 60-90 s entre vueltas.
- **Freno de bucles**: si una pestaña pide la misma página 5 veces en 1 minuto
  sin llegar, se frena 5 min (el 27/09 a las 04:55 el héroe pidió
  /hero/attributes 30 veces en 45 s).
- Si una pestaña termina fuera del servidor del juego (sesión vencida), el bot
  se detiene y avisa.

## Cambios v3.9 (26/09/2026) — la farm list la manda el service worker
- Con la PC cargada Chrome le daba tan poca CPU a la pestaña de farm list que
  un envío tardaba hasta 6 minutos. Ahora el **service worker** hace lo mismo
  que "Start all farm lists" sin cargar ni dibujar la página: lee el HTML de
  la farm list (en `viewData` vienen las listas con sus objetivos activos,
  `slotsStates`) y manda cada lista con `POST /api/v1/farm-list/send`, en
  serie como el botón. El servidor contesta `error: null` por objetivo.
- Cada ~69 s (alarma `tb_farm`); si algo falla reintenta a los 20 s; si la
  alarma se pierde, el vigilante la manda.
- La pestaña de farm list queda abierta sólo para mirar (se refresca cada
  3 min). Volver al botón de la página: `cfg.farm.modo = 'pagina'`.

## Cambios v3.6 – v3.8 (26/09/2026)
- **Farm list = prioridad 1.** Aprieta **"Start all farm lists"**
  (`button.startAllFarmLists`). Ese botón manda las listas DE A UNA
  (`POST /api/v1/farm-list/send`, ~2,5 s cada una con la PC cargada): la
  pestaña espera hasta 90 s a que salgan todas antes de recargar. Recarga la
  farm list antes de cada envío: la página vieja deja los botones apagados
  aunque estén disponibles. Si no salió nada, reintenta a los 20 s.
- Mientras la farm list está por salir o saliendo, Tropas, Héroe y
  Construcción esperan ("cedo el paso a la farm list").
- **Tropas entra como una persona**: clic en la aldea en la lista de la
  derecha y clic en el ícono verde del edificio (arriba de Population /
  Loyalty: mercado, cuartel, establo, taller). Completa las cantidades y manda
  el formulario de esa página. Antes de cada ronda mira
  `/village/statistics/troops/training` y sólo va a los edificios con menos de
  10 min de cola. Modo `directo` (fetch sin navegar) queda en `cfg.tropas.modo`.
- Las pestañas del bot se sacan el `newdid` de la dirección: al recargarse ya
  no cambian la aldea activa de toda la sesión.
- Cierra las pestañas de Travian que no son del bot (al arrancar y al
  actualizar) y las viejas que el bot reemplazó (cada minuto).

## Cambios v3.5 (26/09/2026)
- **Tropas entrena sin navegar**: GET del edificio + POST del formulario
  (`form[name=snd]`, que ya trae el `did` de la aldea) por `fetch`, y confirma
  en la respuesta que la cola de entrenamiento creció (✔ en el log). Una ronda
  por las 8 aldeas pasó de 5+ minutos a ~2. Si el envío directo no se confirma
  3 veces seguidas, vuelve solo al método viejo (navegar y hacer clic).
- Entre rondas la pestaña de Tropas espera en `/profile`: en un cuartel con
  cola, Travian recarga la página cada vez que termina una unidad.
- Tropas pide el candado ANTES de cambiar de aldea y cede el turno si
  Construcción espera (antes Construcción no entraba nunca).
- Candado de 90 s (antes 30) y espera de turno de 3 min (antes 1).

## Cambios v3.4 (26/09/2026)
- Tropas: el avance se guarda antes de "Train" (antes entrenaba una y otra vez
  en el mismo edificio hasta vaciar la aldea). Igual en campos, edificios,
  herrería y NPC.
- `run_at: document_end`: la pestaña toma el control apenas llega el HTML.
- Service worker con caché en memoria; sólo lo que lee-y-escribe va en fila.
- Métrica de carga por página en `tb_metrica` (iny/rtt/ida/dur/vuelta).

## Cambios v3.2 (26/09/2026)
- Una sola vuelta por pestaña a la vez (antes dos disparos simultáneos corrían
  la ronda dos veces: farm list mandada 9 veces, tropas "no llego al edificio").
- La aldea activa se lee del `data-did` que dibuja el servidor
  (`input.villageInput`, `.listEntry.village.active`), no del nombre.
- Héroe: espera a que React dibuje la tabla de aventuras.
- Service worker: todo en fila (candado atómico, sin pestañas repetidas).
- Recargar la extensión (↻) ya NO apaga el bot: sigue y recarga sus pestañas.

## ¿Tengo que dejar las pestañas abiertas?
Sí, pero podés minimizar. No cerrarlas, no cerrar Chrome, no suspender la PC.
`chrome://settings/performance` → Ahorro de memoria desactivado.

## Si algo no funciona
Botón **copiar diagnóstico** abajo del panel: guarda URL, aldea, contadores,
los botones de la página y un pedazo del HTML de la última falla. Pegámelo.

Lo que NO pude verificar en tu servidor (se avisa en el log si falla):
construir un edificio desde cero, el diálogo de confirmación de "terminar con
oro", y cómo se ve el botón de herrería cuando no alcanzan los recursos.

## Archivos
| | |
|---|---|
| `manifest.json` | declaración; sólo dominios `travian.*` |
| `background.js` | service worker: pestañas, estado, vigilante, candado |
| `content.js` | escaneo + los 4 features, corre dentro de cada pestaña |
| `panel.html/.css/.js` | el popup del ícono |
