# Vim navigation

Feature: navegación por teclado estilo Vim en Moji+, con setting para activar/desactivar.

## Specs

- S1: Pedido del usuario (verbatim): "vamos a implementar la feature de navegacion  por la aplicacion mediante teclado,  al estilo de VIM, teniendo un setting para poder activar y desactivar ese navigation mode VIM"
- S2: Alcance confirmado por el usuario: "Preview + app" — preview + tabs, sidebar/outline, foco entre paneles; el editor queda aparte.
- S3: Editor confirmado por el usuario: "No tocar editor" — la navegación Vim solo aplica fuera del editor; en el editor se mantienen atajos actuales.
- S4: Keymap confirmado por el usuario: "Scroll+tabs+foco" — "Scroll + gt/gT + h/l o atajos para mover foco entre preview/sidebar/outline."
- S5: Setting booleano para activar/desactivar el modo de navegación Vim, expuesto en Settings (patrón `alwaysShowTabs`/`outlineVisible`), persistido y sincronizado como el resto de settings.
- S6: El modo Vim no debe robar teclas cuando hay foco en input/textarea/select/contentEditable/editor, cuando hay diálogo/modal abierto, o durante composición IME.
- S7: Indicador visible del estado del modo Vim (al menos cuando está activo) para evitar confusión.

## Tasks

| ID | Specs | Route | Commit | Status | Notes |
|---|---|---|---|---|---|
| T1 | S1,S5 | inline | tbd | done | Setting `vimNavigation` agregado end-to-end (shared/settings/ipcInput/useAppState/SettingsDialog/brand locales). typecheck OK. |
| T2 | S1,S2,S3,S4,S6 | inline | tbd | done | Handler Vim global en App.tsx con guardas, scroll j/k/Ctrl+d/u/gg/G, secuencias gt/gT, foco h/l. typecheck OK. |
| T3 | S1,S2,S4 | inline | tbd | done | Integrado en preview/split/tabs/sidebar; arrow keys de outline sin conflicto. |
| T4 | S1,S7 | inline | tbd | done | Indicador VIM en StatusBar + i18n en brand overlays. typecheck OK. |
| T5 | S1-S7 | inline | tbd | done | `npm run typecheck` OK, `npm run verify` (typecheck+check-branding) OK. Smoke manual pendiente en GUI. |

## Log

- L1 (user request, verbatim): "vamos a implementar la feature de navegacion  por la aplicacion mediante teclado,  al estilo de VIM, teniendo un setting para poder activar y desactivar ese navigation mode VIM"
- L2 (decision): Alcance = "Preview + app" (preview + tabs, sidebar/outline, foco entre paneles; editor queda aparte).
- L3 (decision): Editor = "No tocar editor" (Vim nav solo aplica fuera del editor).
- L4 (decision): Keymap = "Scroll+tabs+foco" (Scroll + gt/gT + h/l o atajos para mover foco entre preview/sidebar/outline).
