# Reglas para la IA

Este archivo es la fuente oficial de las reglas del proyecto.

Proyecto actual: Aplicación de escritorio Moji, Electron + React + TypeScript para abrir, ver, editar y exportar archivos Markdown.

## Reglas generales

- Responder y cambiar en función del estado real del repositorio.
- Antes de documentar una característica, confirme que esté integrada en el flujo principal, no solo presente en un componente aislado.
- Mantenga los cambios pequeños y alineados con el orden.
- Preservar los cambios de usuarios locales; no revierta archivos fuera del alcance solicitado.
- Prefiera `rg` para buscar archivos/texto.
- Utilice `npm run typecheck` (o `npm run verificar`, que actualmente solo ejecuta typecheck) para validar TypeScript cuando hay un cambio en el código. No hay ningún conjunto de pruebas automatizadas en el proyecto; no asuma la cobertura de la prueba ni reintroduzca los arneses de prueba sin una solicitud explícita.

## Pila y arquitectura

### Proceso principal (`electron/`)

- `main.ts`: ventana (`BrowserWindow` 1000x760, min 640x480, sin barra de título nativa: `titleBarStyle: 'hidden'` con semáforos a través de `trafficLightPosition` en macOS y `titleBarOverlay` en Windows/Linux; estado de pantalla completa enviado al renderizador mediante `IPC.fullscreenChanged`), bloqueo de instancia única con reenvío de archivo argumentos, controladores IPC (a través de un contenedor que solo acepta eventos provenientes de la ventana de la aplicación), apertura a través de un cuadro de diálogo nativo, CLI (`process.argv`), evento `open-file` (macOS/Linux), arrastrar y soltar (a través de `webUtils.getPathForFile`) y menú de la aplicación (solo en macOS; Windows y Linux se quedan sin menú).
- `preload.ts`: expone API segura al renderizador a través de `contextBridge` con escritura completa (`RendererApi`).
- `shared.ts`: tipos y constantes compartidos entre principal, precarga y renderizador (`Settings`, `ExportFormat`, `SUPPORTED_LANGUAGES`, canales `IPC`, formatos/tamaños de exportación, tipos de progreso de apertura/exportación/actualización, tipos de borrador (`AutoSaveDraft`, `RestoredDraft`), sesión (`SessionState`, `SessionEntry`), cambios externos (`DocumentChangedEvent`, `SaveOptions`) y métricas de rendimiento).
- `ipcInput.ts`: normaliza los valores provenientes del renderizador mediante IPC (`sanitizeSettingsPatch`, `sanitizeSession`, `sanitizeDraft`, `suggestedMarkdownName`, `isMarkdown`). Cada carga útil del renderizador pasa por aquí antes de persistir o usarse en el diálogo nativo.
- `assetPaths.ts` / `assetCache.ts`: autorización y caché del protocolo `moji-asset://` (`assetPathFromUrl`, `isPathWithin`, `authorizedAsset`, `assetContentType`, `AssetCache`). Se resuelve mediante `realpath` y solo muestra imágenes dentro del directorio publicado por el documento abierto; El caché evita la relectura del disco mediante metadatos (tamaño/mtime).
- `documentStream.ts` / `documentDecoder.ts`: lectura del archivo en fragmentos (`readFileChunks`) entregado al renderizador a través de `MessagePort` como bytes UTF-8 (canal `file:read-path-stream`), evitando materializar toda la cadena en main; `stripLeadingBom` elimina la lista de materiales UTF-8 firmada.
- `documentWatcher.ts`: `DocumentWatcher` observa las carpetas de documentos abiertas (no el archivo, para sobrevivir al guardado atómico mediante cambio de nombre) y lo compara con la versión conocida por el renderizador (`size`/`mtimeMs`/sha256 registrado al final del flujo de lectura y después de cada guardado). Notifica a `IPC.documentChanged` (`modificado`/`eliminado`) solo cuando los bytes cambian, sin repetir el mismo estado; `checkAll` se ejecuta en la ventana `focus` como alternativa a `fs.watch`.
- `openPool.ts`: `mapWithConcurrency` para abrir múltiples archivos en paralelo con límite de concurrencia, usado en el flujo de apertura por lotes (`openManyProgress`/`openManyDone`).
- `fileCapabilities.ts`: detección de capacidades del sistema de archivos relevantes para la apertura/escritura.
- `settings.ts`: persiste la configuración del usuario en `settings.json` en `userData`; resuelve el idioma inicial desde la configuración regional del sistema operativo; aplica límites numéricos (`boundedNumber`).
- `drafts.ts` / `draftStore.ts` / `draftJournal.ts` / `draftCapacity.ts`: persiste borradores internos de documentos sin ruta y cambios de archivos no guardados (con `path` y `baseHash`, el hash de la versión del disco en el que se realizaron las ediciones) en `drafts/` en `userData`. `draftJournal` escribe un diario de ediciones solo para agregar (`appendDraftEdits`) en lugar de reescribir el borrador completo en cada tick; `draftCapacity` calcula los límites de memoria/disco (`DraftPersistProblem`) y rechaza escribir cuando la máquina no soporta el resultado, informando siempre los números detrás del rechazo.
- `export.ts`: exporta el documento activo como PDF (a través de `printToPDF` en `BrowserWindow` oculta), PNG (a través de captura de corte + trabajador PNG) o HTML (escritura directa). Admite A4/Carta/Legal y retrato/paisaje, y el progreso por fase ("ExportPhase") se informa al renderizador.
- `png.ts` / `pngWorker.ts` / `pngScanlines.ts` / `pngScanlineConverter.ts`: codificación PNG de la exportación que ejecuta el bucle de píxeles (`toScanlines`) en `worker_threads`, aislada del codificador para que pueda reutilizarse y probarse de forma aislada.
- `benchmark.ts` / `rendimiento.ts`: colección local de métricas de rendimiento (`PerformanceMetric`/`PerformanceReport`, nunca con contenido del documento, rutas o datos de usuario) y scripts de referencia (`benchmark:corpus`, `benchmark:ipc`, `benchmark:record`, `benchmark:compare`) fuera del paquete de la aplicación.
- `updater.ts`: gestiona la verificación, descarga e instalación de versiones de GitHub con `electron-updater`; Solo habilitado en Windows NSIS empaquetado y Linux AppImage.

### Renderizador (`src/`)

- `App.tsx`: estado principal (documentos, pestaña activa, modo ver/editar/dividir/buscar/exportar, tema Markdown, arrastrar y soltar, esquema de desplazamiento-espía, recuento de palabras/líneas/tokens, progreso de apertura/exportación, estado de actualización).
- `src/components/`: componentes de React que incluyen `AboutDialog`, `ConfirmDialog`, `DocumentTabs`, `Editor`, `ExportDialog`, `ExternalChangeDialog`, `ExportProgress`, `FontSizeButton`, `MermaidDiagramDialog`, `OpenProgress`, `OutlineTree`, `Preview`, `SettingsButton`, `SettingsDialog`, `Sidebar`, `SplitView`, `StatusBar`, `TopBar`, `UpdateNotice`, `Bienvenido`, `iconos`.
- `SplitView.tsx`: muestra el editor y la vista previa uno al lado del otro durante la edición (controlado por `settings.splitView`), con divisor ajustable (`settings.splitRatio`, 20-80%) y ancho mínimo del espacio de trabajo (`SPLIT_MIN_WIDTH_PX`) por debajo del cual no cabe la división.
- `src/lib/`: utilidades que incluyen `draftEdits`, `draftFailure`, `editorIndent`, `exportHtml`, `markdown`, `markdownCore`, `markdownWorkerClient`/`markdownWorkerProtocol` (representación de Markdown en trabajador), `mermaid`/`mermaidGuide`, `outline`, `rendimientoMetrics`, `previewLayoutMetrics`, `previewSchedule`, `previewScroll`, `previewSearch`, `previewSelection`, `previewVirtualization`, `search`, `splitScroll` (sincroniza el desplazamiento entre el editor y la vista previa en vista dividida), `useDebounced`.
- `src/locales/`: archivos de traducción JSON para todos los idiomas definidos en `SUPPORTED_LANGUAGES`.
- `src/styles/`: `theme.css` (tokens), `markdown.css` (vista previa/exportación), `app.css` (diseño).
- `src/types/`: `api.d.ts` (tipificación de API precargada), `vite-env.d.ts`.

### Otros directorios

- `samples/`: documentos de Markdown de referencia empaquetados con la aplicación.
- `scripts/`: scripts de ayuda para `electron-vite`, instalación del binario de Electron y puntos de referencia (`generate-benchmark-corpus`, `measure-ipc-transport`, `run-benchmark`, `compare-benchmark`).
- `build/`: iconos y recursos para `electron-builder`.
- `openspec/specs/`: especificaciones de comportamiento actuales.

### Pila técnica

- Markdown representado por `markdown-it` con complementos (`markdown-it-anchor`, `markdown-it-task-lists`, `markdown-it-footnote`, `markdown-it-deflist`, `markdown-it-sub`, `markdown-it-sup`, `markdown-it-mark`, `markdown-it-ins`, `markdown-it-abbr`, `markdown-it-emoji`, `markdown-it-texmath`), fórmulas LaTeX vía `katex`, código resaltado con `highlight.js`, diagramas con `mermaid` y HTML desinfectado con `DOMPurify`. El renderizado se ejecuta en un trabajador (`markdownWorkerClient`/`markdownWorkerProtocol`) para no bloquear la interfaz de usuario en documentos grandes.
- Editor basado en CodeMirror 6 (`@codemirror/commands`, `@codemirror/lang-markdown`, `@codemirror/search`).
- Internacionalización con `i18next` + `react-i18next`.
- Construcción/desarrollo con `electron-vite`.
- Empaquetado con `electron-builder` (NSIS para Windows, AppImage/deb para Linux, universal DMG/ZIP para macOS).
- Actualización automática con `electron-updater` y metadatos publicados en GitHub Releases. No disponible en macOS: las compilaciones sin firmar no se pueden actualizar automáticamente.
- Nodo requerido: `^20.19.0 || >=22.12.0` (Vite 7 / electron-vite 5 y ESM `require()` en el paquete). Declarado en `motores` en `package.json`.

### Formatos de exportación admitidos

`pdf`, `html`, `png` (definido en `ExportFormat` en `electron/shared.ts`).

### Idiomas admitidos

`en`, `en-GB`, `pt-BR`, `pt-PT`, `es`, `fr`, `de`, `it`, `nl`, `ar`, `hi`, `ja`, `zh`, `zh-TW`, `ru` (definido en `SUPPORTED_LANGUAGES` en `electron/shared.ts`).

## Reglas del código

- Escribir código claro, organizado y mantenible.
- Respetar la estructura actual: `electron/main.ts` para ventana/IPC/ciclo de vida; `electron/preload.ts` para un puente seguro; `electron/shared.ts` para tipos/contratos; `electron/settings.ts` para persistencia; `electron/export.ts` para exportación; `src/` a renderer/componentes/libs/styles/locales.
- Mantenga `nodeIntegration: false`, `contextIsolation: true` y `sandbox: true` en el renderizador.
- Desinfecta el HTML renderizado antes de usar `dangerfullySetInnerHTML`.
- Abra enlaces externos en el navegador del sistema (`shell.openExternal`), no dentro de la aplicación.
- Trate los archivos compatibles como `.md` y `.markdown`.
- Proteger el cierre de documentos/aplicaciones cuando hay cambios no guardados (flujo `requestClose` -> `confirmClose` -> `forceQuit`).
- Distinguir cerrar ventana de cerrar aplicación: en macOS, cerrar una ventana no finaliza el proceso. Cada salida (Cmd+Q, Dock Quit, `before-quit`) pasa por `requestQuit` -> guardia no guardada -> `app.quit()`.
- El menú de aplicaciones solo existe en macOS, donde el sistema dirige los atajos del portapapeles (Cmd+C/V/X/A) a través del menú; sin él, el renderizador nunca los recibe. Mantenga los roles de edición predeterminados cuando utilice el menú.
- Al agregar formato de exportación, actualice `ExportFormat` en `electron/shared.ts`, filtros en `electron/export.ts`, UI en `ExportDialog.tsx`, traducciones en configuraciones regionales y documentación.
- Al agregar idioma, actualice `SUPPORTED_LANGUAGES` en `electron/shared.ts`, cree la configuración regional JSON en `src/locales/` y documente.
- Los paneles del espacio de trabajo en línea (exportación, configuración, acerca de) comparten la estructura `.export-dialog`; reutilice este patrón al crear otros nuevos.
- Muestra la versión de la aplicación desde `package.json`, no con una cadena fija.
- Al modificar `electron/shared.ts`, verifique la coherencia con `electron/preload.ts` (API expuesta) y los controladores en `electron/main.ts`.
- La configuración del usuario persiste a través de `electron/settings.ts` en JSON; agregue nuevos campos con valores predeterminados y limite la validación (`boundedNumber`).
- La lista de archivos recientes usa `settings.recentFiles`, limita `MAX_RECENT_FILES` en `electron/shared.ts` y debe mantener primero las rutas deduplicadas en el orden más reciente.
- Los cuadros de diálogo nativos para abrir, guardar como y exportar utilizan `settings.lastDialogDirectory`; Recuerde el directorio después de completar la operación o la ruta elegida.
- Las pestañas de Markdown en `samples/` se abren en modo editor con la vista dividida habilitada, mostrando el código fuente de solo lectura y una vista previa una al lado de la otra cuando hay suficiente ancho. Permitir selección, copia, búsqueda y desplazamiento sincronizado; No permita editar, reemplazar, formatear accesos directos, guardar o guardar como recursos empaquetados.
- Los documentos nuevos sin archivo deben recibir un título localizado: el primero usa `app.untitled`; los siguientes utilizan el mismo título con secuencia creciente.
- Los documentos sin archivos utilizan un borrador de recuperación interno de forma predeterminada (`settings.autoSave`); se vuelven a abrir en la siguiente sesión y eliminan el borrador al guardarlo como archivo, cerrar la pestaña o descartarlo. Al cerrar la pestaña de un documento con contenido siempre se pregunta (guardar/descartar/cancelar), incluso con un borrador guardado; Simplemente sal y confía en el draft y no preguntes. Las ediciones se guardan mediante el archivo adjunto del diario (`draftJournal.ts`) siempre que sea posible; pasa a la grabación de borrador completo solo cuando la revista informa "desincronizado" o "borrador desconocido".
- Los archivos con cambios a guardar también usan borrador con `settings.autoSave`: al salir no se pregunta y se vuelve a abrir con los cambios, incluso con `settings.reopenFiles` desactivado; cerrando la pestaña continúa preguntando. Cuando el archivo regresa al disco (guardar, recargar o deshacer), el borrador se elimina y el documento recibe un nuevo `draftId` (`DraftStore` nunca reutiliza los ID).
- Sesión: `settings.session` almacena los separadores (`path` y/o `draftId`) y el activo; el arranque los restaura en ese orden. Los archivos no borradores solo se vuelven a abrir con `settings.reopenFiles`. Nunca grabe la sesión antes de restaurarla.
- Disposición: `settings.viewMode` (solo se guarda con documentos abiertos), `settings.outlineVisible`, `settings.previewFluidWidth` y `settings.windowMaximized` (este guardado por main) se restauran al inicio.
- Posición de lectura por documento: línea de código fuente (fraccional) en la parte superior de la vista, la misma coordenada que `splitScroll.ts`, guardada en `session.documents[].scrollLine` (con rebote y al salir) y reseteada al activar la pestaña. Durante el reinicio, ignore el desplazamiento de esa pestaña.
- El estado alterado compara el texto con `savedContent` (normalizado a `\n`, como CodeMirror), solo cuando la longitud coincide, para deshacerlo hasta que el original borre la marca.
- La negativa a escribir un borrador (`DraftPersistProblem`) siempre debe informar el motivo (`memory-budget`/`disk-space`) y los números involucrados (`requiredBytes`/`availableBytes`) a la interfaz de usuario, nunca un error genérico.
- Cambios externos en documentos abiertos: el documento sin cambios locales se recarga silenciosamente con una advertencia; con cambios locales o archivo eliminado, `ExternalChangeDialog` solicita (recargar/guardar/guardar como/conservar) solo la pestaña activa, nunca cambia de pestaña sola. `IPC.save` se niega con `error: 'conflicto'` cuando el disco diverge de la versión conocida; Simplemente escríbalo con `{ overwrite: true }` después de una confirmación explícita. No se siguen las guías en `samples/`.
- La apertura de documentos grandes utiliza lectura de flujo fragmentado (`documentStream.ts`) a través de `MessagePort`; abrir varios archivos utiliza `mapWithConcurrency` (`openPool.ts`) e informa el progreso incremental (`openManyProgress`/`openManyDone`).
- Los atajos globales deben respetar la composición del texto, evitar el comportamiento predeterminado cuando se activan y tener una referencia ubicada en Configuración.
- Los atajos de formato Markdown pertenecen al mapa de teclas CodeMirror; preservar la selección y el enfoque después de aplicar la transformación.
- Las exportaciones de PDF y PNG deben romper largas líneas de bloques de código, sin cortar el contenido horizontalmente. La exportación PNG utiliza sectores (`slice`/`slices`) codificados por el subproceso de trabajo (`pngWorker.ts`), informando el progreso por fase (`ExportPhase`).
- Las métricas de rendimiento ("PerformanceMetric") nunca pueden cargar contenido de documentos, rutas de archivos u otros datos del usuario.

## Vista dividida

- La vista dividida (editor + vista previa lado a lado) solo aparece durante la edición y está controlada por `settings.splitView`; la proporción entre paneles usa `settings.splitRatio` (20-80%, predeterminado 50%) y no se puede aplicar cuando el espacio de trabajo es más pequeño que `SPLIT_MIN_WIDTH_PX`.
- El desplazamiento del editor y de la vista previa debe permanecer sincronizado en la vista dividida (`src/lib/splitScroll.ts`); la sincronización utiliza la posición lógica en el documento, no solo los píxeles, para permanecer correcta después de volver a renderizar desde la vista previa (por ejemplo: cambio de tema).
- La dirección de sincronización sigue la interacción del usuario, incluido hacer clic en la barra sin desplazamiento, sin tiempo de espera que permita que los eventos de diseño retrasados ​​tomen el control. Reutilice las posiciones de los encabezados siempre que el diseño no cambie y conserve las barras nativas.
- Cuando llegue al final del desplazamiento del editor, alinee la vista previa también al final, incluso después de escribir o insertar líneas. Considere la fracción visible de líneas discontinuas y espere la medición de CodeMirror al sincronizar desde la vista previa, evitando saltos en la siguiente edición.
- Los parches DOM de vista previa (tema, resaltado, sirena) se deben volver a aplicar después de cualquier renderizado que reemplace el HTML, incluso dentro de la vista dividida.

## Modales y Diálogos

- Cada modal, incluidos los actuales y futuros, sigue el cromo (claro u oscuro), la superficie `--modal-surface`, el borde `--modal-border`, la sombra `--shadow` y los controles compactos neutrales del tema activo.
- Los encabezados modales usan un título claro, un ícono sin color resaltado, una acción de cierre separada de otras acciones y espacios definidos por tokens. Los controles de navegación o las acciones auxiliares permanecen neutrales hasta que se desplaza/enfoca.
- Cada modal debe aceptar arrastrar a lo largo de los cuatro bordes y las cuatro esquinas, respetar el tamaño mínimo y los límites de la ventana y mantener fijo el borde opuesto al cambiar el tamaño desde la izquierda o desde arriba.
- Cuando haya un fondo, "Escapar" y hacer clic fuera del contenido para cerrar/cancelar solo cuando sea seguro para el flujo; Las interacciones internas no pueden propagarse al fondo.
- Los modales y diálogos deben tener `role="dialog"`, etiqueta accesible, botones icónicos con `title`/`aria-label` y contraste AA.

## Diagramas de sirena

- Cada bloque de Sirena válido debe renderizarse en la vista previa, sin filtrar por tipo de diagrama; use el tema Sirena "predeterminado" en la vista previa clara y "oscuro" en la vista previa oscura.
- Al hacer clic en un diagrama se abre el visor `.diagram-modal`. El encabezado muestra el nombre declarado del diagrama (o su tipo), el ícono neutral, la navegación central `<actual/total>` y los controles de zoom, ajuste, descarga y cierre.
- La navegación entre diagramas debe preservar la posición en la colección, desactivar la flecha cuando no hay anterior/siguiente y no aplicar color de resaltado a estas flechas o al icono del título.
- El zoom del visor usa solo niveles fijos del 10% al 1000%, incluye "Ajustar a la vista", permite una panorámica libre arrastrando y muestra el minimapa solo por encima del 100%.
- El minimapa representa el área de trabajo (diagrama, ventana gráfica y margen vacío), acepta hacer clic/arrastrar en ambos ejes y no debe imponer límites en la panorámica del lienzo.
- El visor hereda el estándar modal global y utiliza un mínimo de 480x360px.
- La exportación individual del diagrama genera PNG mediante IPC seguro y sugiere el nombre `nombre-de-archivo-del-diagrama-n.png`; elimine los caracteres no válidos del nombre del archivo antes de enviarlo al diálogo nativo.
- El escritorio y SVG siguen el tema de vista previa actual, sin cambiar artificialmente los colores del diagrama más allá del tema Sirena correspondiente.

## Buscar y reemplazar

- Los campos de búsqueda y reemplazo usan `type="search"` con el botón X nativo para borrar el texto (diseñado a través de `::-webkit-search-cancel-button` en `src/styles/app.css`).
- La búsqueda en vista previa abre una ventana emergente con el contador actual/total y las acciones anteriores/siguientes; Al cambiar a edición, la ventana emergente asume el modo de reemplazo con el campo de destino, la línea de navegación anterior/siguiente y una línea separada para reemplazar/reemplazar todo.
- Active Match utiliza resaltado amarillo en la vista previa (`search-highlight--active`) y en el editor (`cm-external-searchMatch--active`); otras coincidencias utilizan el color de acento estándar. Anterior/siguiente mueve el resaltado activo junto con el contador y el desplazamiento.
- El flujo pasa `searchTerm`/`activeSearchIndex` a la vista previa y al editor; `activeSearchIndex` controla el resaltado de coincidencias activas.

## Reglas de diseño y diseño

El patrón visual está documentado en `.ai-framework/DESIGN.md`.

- Utilice `src/styles/theme.css` como fuente de token.
- El tema se aplica a toda la aplicación (chrome, editor, modales y vista previa). La preferencia `settings.appearance` (`system`/`light`/`dark`, `system` predeterminado) se aplica a `nativeTheme.themeSource` en main; el renderizador lee el tema resuelto por `prefiere-color-scheme` y escribe `data-theme` en `<html>`. El botón sol/luna en la barra superior registra la elección explícita frente al tema actual; Configuración > General le permite regresar a "Sistema". Exportar (HTML/PDF/PNG) siempre utiliza el tema claro.
- Cada token de color cromado necesita un valor en ambas paletas de `theme.css` (`:root` dark y `:root[data-theme='light']`).
- La fuente de visualización predeterminada es "Inter"; No cambie el valor predeterminado, elimínelo de la configuración o reemplácelo con la pila del sistema sin una solicitud explícita del usuario.
- Reutilizar clases/componentes existentes antes de crear variaciones.
- La ventana no tiene barra de título nativa; la barra superior ocupa la parte superior y debe mantener libre el área de controles nativos (`data-platform`/`data-fullscreen` en `<html>`). Cada nuevo elemento interactivo en la barra superior necesita `-webkit-app-region: no-drag`. En Windows/Linux, los colores de superposición de control (`titleBarOverlay()` en `electron/main.ts`) reflejan `--chrome-bg` y `--text-muted` del tema resuelto y se actualizan en `nativeTheme` `updated`; manténgase sincronizado al cambiar estos tokens.
- Mantenga un diseño compacto: barra superior, pestañas de documentos, barra lateral/esquema, espacio de trabajo (editor, vista previa o vista dividida) y barra de estado.
- Priorizar la lectura, el contraste, el truncamiento de textos largos y estados visuales predecibles.
- No utilizar colores, sombras, rayos o espacios sueltos cuando exista una ficha existente.
- Asegúrese de que los textos no desborden botones, pestañas, ventanas emergentes o cuadros de diálogo.
- Crear nuevas soluciones visuales sólo cuando exista una necesidad real de producto, usabilidad o escala.

## Documentación

- `README.md` debe describir el uso, las características y los comandos reales del proyecto.
- `.ai-framework/DESIGN.md` debe reflejar los tokens y componentes implementados.
- Actualice la versión que se muestra en README, `package.json`, `package-lock.json` y CHANGELOG cuando prepare una nueva versión.
- Actualice las referencias de versiones visibles en HTML y configuraciones regionales al preparar una nueva versión, mientras la pantalla Acerca de continúa leyendo `package.json`.
- No prometer recursos incompletos como listos; Si es necesario, márquelo como en progreso.
- Actualice README, DISEÑO y reglas al cambiar arquitectura, exportación, temas, idiomas o flujo principal.

## Guard Rails

- No ejecutar comandos directamente en el entorno de producción.
- No realizar cambios destructivos o irreversibles sin confirmación y explicación explícita del impacto.
- No introduzcas dependencias, abstracciones, estilos o estructuras sólo por preferencia personal.
- No ignore el impacto en la seguridad, el rendimiento, la usabilidad, el mantenimiento o la coherencia visual.
- No editar archivos generados o archivos de bloqueo sin necesidad de la solicitud.
