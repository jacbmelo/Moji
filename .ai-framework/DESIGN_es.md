# Sistema de diseño

Este archivo describe el estándar visual actual de Moji.

Fuente de verdad para los tokens: [`src/styles/theme.css`](../src/styles/theme.css). Los componentes y las pantallas deben utilizar estos tokens antes de crear nuevos colores, medidas o variantes.

## Principios

- Leer primero: vista previa limpia, columna centrada y cromo discreto.
- Coherencia en el uso de tokens CSS; Evite valores sueltos en los componentes.
- Tema único claro/oscuro para toda la aplicación (chrome, editor, modales y vista previa), siguiendo el sistema por defecto; Los archivos exportados siempre están claros.
- Controles compactos y predecibles diseñados para uso repetido.
- Reutilizar componentes/clases existentes antes de crear nuevas variaciones.

## Estructura

La aplicación Electron utiliza un caparazón en capas:

- **Barra superior** (`.topbar`): dos líneas sobre `--chrome-bg`. La primera línea contiene acciones de archivo (*Nuevo*, *Abrir*, *Guardar*) y un campo de búsqueda con botón de reemplazo. La segunda línea contiene el selector segmentado *Vista previa/Editor/Exportar* y el tema, la configuración y las acciones (icono de información). Los atajos globales se centran en buscar/reemplazar, cambiar paneles o realizar acciones sin cambiar el diseño.
- **Pestañas de documentos** (`.document-tabs`): barra horizontal debajo de la barra superior, visible cuando los documentos están abiertos. Cada pestaña tiene un ancho estable, un marcador de cambio y un botón de cierre.
- **Menú de pestañas** (`.document-tab__menu`): menú contextual compacto activado por un botón icónico en la pestaña activa; ofrece cerrar otras pestañas, cerrar pestañas a la derecha, cerrar archivos guardados y cerrar todo.
- **Cuerpo** (`.body`): barra lateral + área principal.
- **Sidebar** (`.sidebar`): columna de `--sidebar-w`, visible con el documento abierto. En los modos de vista previa y editor, muestra el árbol de esquema generado a partir de encabezados (anidados por nivel); en la vista previa se resalta el encabezado activo.
- **Principal/espacio de trabajo** (`.main`, `.workspace`): presenta bienvenida, vista previa, editor, cuadro de diálogo de exportación en línea, panel de configuración en línea o panel acerca de en línea.
- **Barra de estado** (`.statusbar`): pie de página de `--statusbar-h`. La izquierda muestra la marca; a la derecha se muestra el enlace de la pestaña Markdown (abre la muestra integrada en el editor con la división habilitada, el código fuente de solo lectura a la izquierda y la vista previa a la derecha) y el recuento de líneas, tokens y palabras del documento activo. La guía reutiliza el divisor, el desplazamiento sincronizado y el límite mínimo de ancho de división; La búsqueda permanece disponible, con guardar y reemplazar deshabilitados.

## Temas

La preferencia "settings.appearance" acepta "sistema" (predeterminado), "claro" u "oscuro". Main lo aplica a `nativeTheme.themeSource`, que también ajusta los controles nativos; el renderizador lee el tema resuelto a través de `prefers-color-scheme` y escribe `data-theme="light|dark"` en `<html>` antes del primer renderizado.

- `:root` establece la paleta oscura completa (cromo + lectura).
- `:root[data-theme='light']` restablece todos los tokens de color a la paleta de luz, incluidos `--modal-*`, `--nav-*`, `--segment-*`, barras de desplazamiento, `--shadow` y `color-scheme`.
- El botón sol/luna en la barra superior cambia toda la aplicación y registra la elección explícita; Configuración > General > Ofertas de temas Sistema / Claro / Oscuro.
- El logotipo (`logo-mark-light.png`) recibe `filtro: invert(1) hue-rotate(180deg)` en el tema claro.

La vista previa usa `data-md-theme` igual que el tema resuelto; la exportación siempre usa `data-md-theme="light"`, que sobrescribe solo los tokens de lectura sobre la raíz oscura:

- `--bg`
- `--bg-elevated`
- `--text`
- `--text-muted`
- `--border`
- `--border-strong`
- `--accent`
- `--code-bg`
- `--code-text`
- `--code-border`
- `--table-header-bg`
- `--table-stripe-bg`
- `--hl-*`

## Tokens

| Token | Valor actual |
| ------- | ------------- |
| `--font-sans` | `'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Ubuntu, Cantarell, sans-serif` |
| `--font-mono` | `'JetBrains Mono', 'SFMono-Regular', Menlo, Consolas, 'Liberation Mono', monospace` |
| `--reading-width` | `760px` |
| `--reading-width-min` | `480px` |
| `--reading-width-fluid` | `100%` |
| `--radius` | `8px` |
| `--radius-sm` | `5px` |
| `--space-1..6` | `4, 8, 12, 16, 24, 32px` |
| `--toolbar-h` | `44px` |
| `--topbar-h` | `52px` |
| `--traffic-lights-w` | `68px` |
| `--statusbar-h` | `34px` |
| `--sidebar-w` | `260px` |
| `--shadow` | sombra leve para popover de reemplazo y diálogos |

## Colores

### Tema oscuro (`:root`)

| Ficha | Valor |
| ------- | ------- |
| `--bg` | `#1e1e1e` |
| `--bg-elevado` | `#252526` |
| `--bg-inset` | `#2b2b2b` |
| `--texto` | `#e7e7e7` |
| `--texto-silenciado` | `#9aa0a6` |
| `--frontera` | `#3a3a3a` |
| `--frontera-fuerte` | `#4a4a4a` |
| `--acento` | `#4c9aff` |
| `--acento-hover` | `#63a9ff` |
| `--acento-contraste` | `#0b1a33` |
| `--código-bg` | `#282c34` |
| `--código-texto` | `#abb2bf` |
| `--código-borde` | `#3a404b` |
| `--table-header-bg` | `#252526` |
| `--table-stripe-bg` | `#252526` |
| `--peligro` | `#ff6b6b` |
| `--marca` | `#6ea8ff` |
| `--barra lateral-bg` | `#1a1a1b` |
| `--cromo-bg` | `#202021` |
| `--nav-hover-bg` | `#2a2a2c` |
| `--nav-active-bg` | `#24314a` |
| `--nav-texto-activo` | `#7cb0ff` |
| `--segmento-pista` | `#2a2a2c` |
| `--segmento-activo-bg` | `#38383a` |
| `--scrollbar-track` | `#202021` |
| `--barra de desplazamiento-pulgar` | `#4c9aff` |
| `--barra de desplazamiento-desplazamiento` | `#63a9ff` |

### Tema claro (`:root[data-theme='light']`)

Lea los tokens igual que en la tabla `data-md-theme='light'` a continuación, más:

| Ficha | Valor |
| ------- | ------- |
| `--bg-inset` | `#eceff3` |
| `--acento-hover` | `#1f5dd6` |
| `--acento-contraste` | `#ffffff` |
| `--peligro` | `#cf222e` |
| `--marca` | `#2f6fed` |
| `--barra lateral-bg` | `#f6f7f9` |
| `--cromo-bg` | `#f3f4f6` |
| `--nav-hover-bg` | `#e8ebef` |
| `--nav-active-bg` | `#dde8fc` |
| `--nav-texto-activo` | `#1f5dd6` |
| `--segmento-pista` | `#e8ebef` |
| `--segmento-activo-bg` | `#ffffff` |
| `--scrollbar-track` | `#f3f4f6` |
| `--modal-bg` / `--modal-surface` / `--modal-inset` | `#ffffff` / `#f6f7f9` / `#eceff3` |
| `--modal-text` / `--modal-text-muted` / `--modal-border` | `#1f2328` / `#656d76` / `#d5dae0` |

### Light Markdown (`[data-md-theme='light']`, usado en la exportación)

| Ficha | Valor |
| ------- | ------- |
| `--bg` | `#ffffff` |
| `--bg-elevado` | `#f6f7f9` |
| `--texto` | `#1f2328` |
| `--texto-silenciado` | `#656d76` |
| `--frontera` | `#d5dae0` |
| `--frontera-fuerte` | `#c2c9d1` |
| `--acento` | `#2f6fed` |
| `--código-bg` | `#f4f6f8` |
| `--código-texto` | `#24292f` |
| `--código-borde` | `#d8dee4` |
| `--table-header-bg` | `#f8fafc` |
| `--table-stripe-bg` | `#f5f7fa` |
| `--scrollbar-track` | `#f6f7f9` |
| `--barra de desplazamiento-pulgar` | `#2f6fed` |
| `--barra de desplazamiento-desplazamiento` | `#1f5dd6` |

## Componentes

- **Barra superior** (`.topbar`): columna flexible, `--chrome-bg`, ocupa la parte superior de la ventana (sin barra de título nativa). El espacio vacío arrastra la ventana (`-webkit-app-region: drag`); Los botones internos, entradas, grupos y ventanas emergentes utilizan "sin arrastre". La primera línea reserva espacio para los controles nativos: `--traffic-lights-w` a la izquierda en macOS (eliminado en pantalla completa mediante `data-fullscreen`) y el ancho de superposición (`env(titlebar-area-*)`) a la derecha en Windows/Linux.
- **Botones de archivo** (`.filegroup`, `.filegroup__btn`): altura 30px, icono + texto, borde `--border`, coloque el cursor sobre `--bg-inset`.
- **Buscar/reemplazar** (`.topbar__search`, `.topbar__replace-popover`): la búsqueda sigue una altura de 30 px, fondo `--bg`, borde `--border` y tipografía de 13 px. Al buscar en la vista previa, la ventana emergente compacta muestra la ocurrencia actual/total y la navegación anterior/siguiente. En el editor, incluso la ventana emergente muestra la entrada de destino y el contador; La navegación anterior/siguiente ocupa su propia línea, seguida de la línea de reemplazar una ocurrencia o reemplazar todas. Active Match usa amarillo con contorno; otras coincidencias permanecen en el color de acento.
- **Segmento** (`.segment`, `.segment__btn`): pista `--segment-track`, botones de 30px, activos en `--segment-active-bg`.
- **Botón de icono** (`.iconbtn`): 34x34px, sin borde visible de forma predeterminada, coloque el cursor en `--bg-inset`, activo con `--accent`.
- **Tamaño de fuente** (`.font-size-control`, `.font-size-popover`): botón icónico antes del tema, disponible en lectura y en el editor. Abre una ventana emergente compacta con acciones de reducción/ampliación, restaura el valor predeterminado (16 px en la vista previa, 14 px en el editor) y el valor actual entre 12 px y 24 px. La vista previa y el editor tienen tamaños separados; En la vista dividida, el control sigue el último panel tocado. El tamaño se guarda en la configuración y permanece entre sesiones.
- **Ancho de lectura** (`.markdown-body--fluid`): el panel de configuración define el ancho de lectura en porcentaje (20-100%, pasos de 5%, persistente, predeterminado 60%), aplicado a través de `--reading-width` en el elemento; la vista previa mantiene un piso legible de `--reading-width-min`, limitado al espacio disponible en ventanas estrechas. El botón icónico disponible solo en la vista previa alterna entre el ancho configurado y el ancho total del panel. El estado activo usa `--accent`; En Moji Plus, el cambio persiste y se restaura al inicio, al igual que el modo y los temas.
- **Pestañas de documentos** (`.document-tabs`, `.document-tab`): altura 35px; la pestaña activa usa `--bg` y el archivo superior `--accent`; el marcador sucio usa `--accent`; El menú de pestaña activa utiliza ventana emergente en `--bg-elevated`, borde `--border`, sombra `--shadow` y acciones compactas de 30px.
- **Barra lateral/esquema** (`.sidebar`, `.outline-tree`, `.outline-item`): el esquema aparece en los modos de vista previa y editor como un árbol anidado por nivel de título. Cada grupo (`.outline-tree__children`) tiene una guía vertical `--border`. Los encabezados con niños son plegables en forma de galón; El botón en la parte superior del panel (`.outline-head__toggle`) expande/contrae todo. Los prefijos `Requisito:`/`Escenario:` se convierten en íconos (`IconBlock`/`IconFlow`) y dejan el texto; El requisito utiliza mayor peso y `--text`, el escenario sangría con `--text-muted`. Los títulos largos se dividen en hasta 2 líneas con el "título" completo al pasar el mouse. El elemento activo usa `--nav-active-text`, fondo suave `--nav-active-bg` y barra diagonal `inset 2px --accent`. En la vista previa, el elemento activo rastrea el desplazamiento mediante scroll-spy (`getActivePreviewHeadingId` en `src/lib/previewScroll.ts`); Al hacer clic, se desplaza suavemente hasta el título. En el editor, al hacer clic se mueve el cursor y se desplaza hasta la línea Markdown del encabezado.
- **Vista previa** (`.markdown-body`): ancho `--reading-width` (porcentaje configurado en el panel, predeterminado 60%), con piso responsivo `--reading-width-min`, o `--reading-width-fluid` cuando la barra superior está activa; relleno `--space-6 --space-5`, tipografía configurable a través del panel de configuración (predeterminado 16px, línea 1.7), encabezados con jerarquía clara y código en `--code-bg`. Los bloques de código usan `.code-block` y muestran `.code-copy-button` al pasar el cursor/enfocar; El botón desaparece durante la selección de texto.
- **Modales y diálogos**: todos usan el Chrome del tema activo con `--modal-bg`/`--modal-surface`, borde `--modal-border`, radio `--radius` y sombra `--shadow`. El encabezado compacto tiene un título claro, un ícono neutral y un cierre separado de las acciones; Los botones icónicos mantienen un color neutro y utilizan un desplazamiento/enfoque predecible. Los controles y cursores invisibles le permiten cambiar el tamaño en cuatro bordes y cuatro esquinas; El tamaño mínimo y los límites de ventana evitan la pérdida de contenido, y los controladores izquierdo/superior preservan el borde opuesto. El fondo, cuando existe, lo oscurece y se cierra solo en flujos seguros.
- **Mermaid Visualizer** (`.diagram-modal`): especialización del patrón modal. Al hacer clic en el diagrama, se abre el espacio de trabajo punteado en el tema de vista previa actual y SVG Mermaid en la paleta claro/oscuro correspondiente. Encabezado: nombre del diagrama de la izquierda; navegación central compacta `< actual/total >`, con flechas neutras y gruesas; acciones hacia la derecha. Los controles de zoom son `−`, selector con niveles fijos de 10% a 1000%, `+` y *Ajustar a vista*. Descargar PNG está separado por un espacio pequeño y cerrado por un espacio más grande. Panorámica y liberación arrastrando; `Escape` o haga clic en el fondo cierra el modal. El minimapa solo aparece por encima del 100%, representa diagrama + ventana gráfica + margen del lienzo y acepta clic/arrastre horizontal y vertical. La descarga sugiere `nombre-de-archivo-del-diagrama-n.png`.
- **Editor** (`.editor-pane`, `.cm-editor`): ocupa toda el área principal, fuente mono de 14px, ajuste de línea y tema CodeMirror del tema activo (One Dark Pro en la oscuridad, GitHub claro en la luz). El mapa de teclas incluye acciones de Markdown para negrita, cursiva, enlace, lista, lista de verificación y bloque de código.
- **Diálogo de exportación** (`.export-dialog`): cuadro de diálogo en línea centrado, ancho `min(760px, calc(100vw - 32px))`, lista de formatos PDF/HTML/PNG, configuración de página para PDF.
- **Diálogo de configuración** (`.settings-dialog`): panel en línea centrado en el mismo patrón que la exportación, ancho máximo 680px. Las pestañas (`.settings-tabs`) separan General (idioma, Sistema/tema Claro/Oscuro, mantienen nuevos documentos y cambios para guardar entre sesiones, vuelven a abrir archivos abiertos al inicio), Vista previa, Editor y Accesos directos. Cada grupo (`.settings-section`) es una tarjeta en `--bg-elevated` con encabezado (`.settings-section__heading`) en `--bg-inset`; General y Vista previa utilizan campos apilados (`.settings-field`) separados por un archivo `--border`, una etiqueta a la izquierda y un control de 36px a la derecha. Los atajos utilizan una cuadrícula de dos columnas (`.settings-shortcuts`), reducida a una en pantallas estrechas, con claves en `.settings-shortcut__key`. Idiomas integrados actuales: inglés, portugués (Brasil), español, japonés, chino y ruso.
- **Acerca del diálogo** (`.about-dialog`): panel en línea centralizado que reutiliza la estructura `.export-dialog`; muestra el nombre de la aplicación, la versión (de `package.json`), el autor, el correo electrónico, el enlace del repositorio y la explicación del nombre. El pie de página (`.about-dialog__update`) muestra el estado del actualizador y un botón con un ícono para buscar actualizaciones. Se abre mediante el botón de información en la barra superior.
- **Confirmar cuadro de diálogo** (`.dialog`): modal con fondo, ancho `min(420px, 90vw)`, usado para cambios no guardados. `.dialog__actions` ajusta la línea (`flex-wrap`) cuando los botones no encajan.
- **Diálogo de cambio externo** (`ExternalChangeDialog`, reutiliza `.dialog`): advierte que el archivo fue cambiado en otra aplicación, eliminado o cambiado en el disco antes de guardarlo. Acciones según el caso: Mantener/Cancelar (también mediante `Escape` o hacer clic en el fondo), Recargar o Guardar, Reemplazar (solo en conflicto al guardar) y Guardar como… como acción principal.
- **Aviso** (`.notice`): bajar el brindis en la barra de estado; el error utiliza `--peligro`.
- **Aviso de actualización** (`.update-notice`): tarjeta compacta fija encima de la barra de estado, con estados de versión disponible, progreso, reinicio y error. Utiliza solo tokens existentes, barra de progreso con `--accent` y error con `--danger`.
- **Botón** (`.btn`, `.btn--primary`): botón de acción estándar utilizado en la bienvenida. `.btn` tiene borde `--border` y fondo `--bg-elevated`; `.btn--primary` usa `--accent`. Acepta icono + texto.
- **Bienvenido** (`.welcome`): pantalla vacía centrada que se muestra sin documento abierto. Logotipo de pilas (`.welcome__logo`, `src/assets/logo-mark-light.png`), eslogan (`.welcome__tagline`), título (`.welcome__title`), acciones de apertura/creación (`.welcome__actions` con `.btn`/`.btn--primary`), sugerencia para arrastrar archivos (`.welcome__hint`) y lista de archivos recientes cuando existan.
- **Archivos recientes** (`.welcome__recent`): tarjeta opcional con un ancho máximo de 480 px, con fondo `--bg-elevated`, borde `--border`, radio `--radius` y relleno `--space-3`. Enumera los documentos abiertos recientemente (persistentes en `settings.recentFiles`, límite `MAX_RECENT_FILES`). Cada línea (`.welcome__recent-item`) tiene un botón de abrir (`.welcome__recent-open`: icono, nombre de archivo y ruta truncados) y un botón de eliminar (`.welcome__recent-remove`, visible al pasar el mouse). Sólo aparece cuando hay entradas.
- **Drop overlay** (`.drop-overlay`): superposición de pantalla completa al arrastrar el archivo Markdown a la ventana.

## Rebaja renderizada

La vista previa debe mantener soporte visual para:

- títulos con anclas
- enlaces
- listas y listas de tareas
- mesas con desbordamiento horizontal
- Portada de YAML en la parte superior del documento como bloque de código `pre.hljs.front-matter` con resaltado de YAML
- citas en bloque
- código en línea y bloques con resaltado.js
- botón copiar en bloques de código, oculto durante la selección de bloque
- Diagramas de sirena representados en el tema actual, en los que se puede hacer clic para abrir el visor `.diagram-modal`
- imágenes receptivas
- búsqueda resaltada a través de `.search-highlight` cuando la búsqueda está conectada

## Capacidad de respuesta

- Ventana mínima actual: 640x480.
- El cuadro de diálogo Exportar se convierte en una columna por debajo de 720 px.
- La cuadrícula de acceso directo a la configuración se convierte en una columna por debajo de 720 px.
- El texto en las pestañas y el nombre del archivo deben truncarse con puntos suspensivos; En el esquema, los títulos largos se dividen en dos líneas.
- Los controles fijos no deben cambiar de dimensión al pasar el cursor, enfocar, marcar sucio o etiquetas largas.

## Accesibilidad

- Contraste AA mínimo para el texto principal en temas claros y oscuros.
- Objetivos principales en los que se puede hacer clic de 30 px o más.
- Los estados de desplazamiento/enfoque deben ser visibles.
- Los botones icónicos necesitan "título" o "etiqueta aria".
- Se puede acceder a las acciones principales a través de la barra superior con "título" o "etiqueta aria" en los botones icónicos.

## Moji Plus: Apple ALTO

La bifurcación superpone estos tokens y parte del marco anterior en `src/styles/plus-hig.css` (ver `.ai-framework/FORK.md`, "Interfaz alineada con Apple HIG"). En macOS: fuente del sistema (`--font-ui`) con escala `--text-title1..footnote` (22/17/15/13/12/11px), colores dinámicos del sistema con alfa, material de `barra lateral` de la ventana detrás de Chrome, barra de herramientas unificada de una línea, separadores solo con dos o más documentos, barras de desplazamiento nativas y cursor de flecha. En todas las plataformas: acento del sistema (`--system-accent`), anillo de enfoque `--focus-ring`, `prefiere-movimiento reducido`, `prefiere-contraste`, menús contextuales y alertas nativas, Exportar como hoja y Configuración en su propia ventana.
