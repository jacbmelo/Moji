# Vim navigation

Feature: navegación por teclado estilo Vim en Moji+, con setting para activar/desactivar.

## Specs

- S1: Pedido del usuario (verbatim): "vamos a implementar la feature de navegacion  por la aplicacion mediante teclado,  al estilo de VIM, teniendo un setting para poder activar y desactivar ese navigation mode VIM"
- S2: Alcance confirmado por el usuario: "Preview + app" — preview + tabs, sidebar/outline, foco entre paneles; el editor queda aparte.
- S3: Editor confirmado por el usuario: "No tocar editor" — la navegación Vim solo aplica fuera del editor; en el editor se mantienen atajos actuales.
- S4: Keymap confirmado por el usuario: "Scroll+tabs+foco" — "Scroll + gt/gT + h/l o atajos para mover foco entre preview/sidebar/outline." (evolucionado por L5-L10: foco global `Ctrl+H/Ctrl+L`; `h/l` en outline para fold/unfold; `j/k` navegan outline cuando el foco está en sidebar; `/` enfoca búsqueda; `?` abre modal de atajos; `Ctrl+J/K` next/prev en búsqueda; segundo `Esc` limpia búsqueda.)
- S5: Setting booleano para activar/desactivar el modo de navegación Vim, expuesto en Settings (patrón `alwaysShowTabs`/`outlineVisible`), persistido y sincronizado como el resto de settings.
- S6: El modo Vim no debe robar teclas cuando hay foco en input/textarea/select/contentEditable/editor, cuando hay diálogo/modal abierto, o durante composición IME.
- S7: Indicador visible del estado del modo Vim (al menos cuando está activo) para evitar confusión.

## Tasks

| ID | Specs | Route | Commit | Status | Notes |
|---|---|---|---|---|---|
| T1 | S1,S5 | inline | 78e6bb7 | done | Setting `vimNavigation` agregado end-to-end (shared/settings/ipcInput/useAppState/SettingsDialog/brand locales). typecheck OK. |
| T2 | S1,S2,S3,S4,S6 | inline | 78e6bb7 | done | Handler Vim global en App.tsx con guardas, scroll j/k/Ctrl+d/u/gg/G, secuencias gt/gT, foco Ctrl+H/Ctrl+L, /, ?, Ctrl+J/K en búsqueda. typecheck OK. |
| T3 | S1,S2,S4 | inline | 78e6bb7 | done | Integrado en preview/split/tabs/sidebar; h/l/j/k en outline via plusOutlineKeys; j/k no scrollean preview cuando foco está en sidebar. |
| T4 | S1,S7 | inline | 78e6bb7 | done | Indicador VIM en StatusBar + VimHelpDialog modal (plus-sheet-backdrop) + sección shortcuts en Settings + i18n brand overlays. |
| T5 | S1-S7 | inline | 78e6bb7 | done | `npm run typecheck` OK, `npm run verify` (check-branding) OK. Smoke manual pendiente en GUI. |
| T6 | S4,S6,S7 | inline |  | done | Refinamientos L5-L10: shortcuts dinámicos en Settings, / búsqueda, ? modal, Ctrl+J/K en búsqueda, Ctrl+H/L foco, h/l/j/k outline, 2do Esc limpia búsqueda. |

## Log

- L1 (user request, verbatim): "vamos a implementar la feature de navegacion  por la aplicacion mediante teclado,  al estilo de VIM, teniendo un setting para poder activar y desactivar ese navigation mode VIM"
- L2 (decision): Alcance = "Preview + app" (preview + tabs, sidebar/outline, foco entre paneles; editor queda aparte).
- L3 (decision): Editor = "No tocar editor" (Vim nav solo aplica fuera del editor).
- L4 (decision): Keymap = "Scroll+tabs+foco" (Scroll + gt/gT + h/l o atajos para mover foco entre preview/sidebar/outline).
- L5 (user feedback): "cuando activamos el modo VIM, deberian de cambiarse los shortcuts que salen en el apartado de shortcuts que hay en settings" — agregado sección Vim en Settings > Shortcuts cuando vimNavigation está activo.
- L6 (user feedback): "vamos a meter dos atajos mas al modo vim: con ? debe de salir un modal con los atajos del vim mode; con / debe ponerse el foco en el search y si dentro del search pulsamos escape, salimos de ese search" — agregados / (foco búsqueda) y ? (modal atajos Vim), Escape en búsqueda ya sale por closeActivePanel/topBarDismissRequest.
- L7 (user feedback): "el supuesto modal... no es modal, porque lo que hace es meterse entre el sidebar izquierdo y la zona central..." + "dos atajos mas solamente para cuando estamos en el search. Con Ctrl j/k..." — VimHelpDialog envuelto en plus-sheet-backdrop; agregados Ctrl+J/K para next/prev en búsqueda cuando vimNavigation está activo.
- L8 (user feedback): "cambiar para que para cambiar el foco entre sidebar el preview sea con ctrl h ... y con ctrl l ... ademas usaremos en el sidebar el h/l para fold/unfold en el tree del outline" — foco global movido a Ctrl+H/Ctrl+L en modo Vim; h/l en outline hacen collapse/expand via plusOutlineKeys.
- L9 (user feedback): "si estamos con el foco en la sidebar, los atajos j/k son para navegar verticamente por el tree..." — j/k en outline via plusOutlineKeys; handler global Vim no intercepta j/k cuando el foco está en .sidebar.
- L10 (user feedback): "cuando pulse otra vez escape, debe de limpiarse el contenido del componente search..." — TopBar dismissRequest: si el panel ya está cerrado y hay término, limpia search/replace y llama onSearch("").
- L11 (reviewer advisory): R2-001 (dedupe Vim shortcut metadata into src/lib/vimShortcuts.ts shared by SettingsDialog/VimHelpDialog) y R3-001 (vimHelpOpen permite Tab/Enter/Space para navegación de teclado en el modal). 
