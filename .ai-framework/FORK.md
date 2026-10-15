# Regras do fork Moji Plus

Moji Plus e uma versao derivada do Moji de Alex Ishida (https://github.com/alexishida/Moji, MIT), mantida em https://github.com/jacbmelo/Moji. Estas regras complementam `.ai-framework/RULES.md`; em caso de conflito, prevalecem as daqui.

## Principio

Alterar o minimo possivel em ficheiros vindos do upstream, para que cada merge de `upstream/main` gere poucos conflitos. A identidade do fork fica concentrada em ficheiros proprios.

## Identidade

- Nome: o nome oficial e **Moji Plus** (`APP_NAME`: `app.setName`, `productName`, pacote `.app`, instaladores, `Name=` do `.desktop`, `<name>` do metainfo, pasta de dados, licenca). Em tudo o que o utilizador le (menus, painel Sobre, Welcome, mensagens, textos traduzidos, README, descricoes) a marca escreve-se **Moji+** (`BRAND_NAME`). O README so diz "Moji Plus" quando se refere ao nome real da app instalada ou a caminhos. O check-branding falha se um texto traduzido disser "Moji Plus". Os comentarios `// Moji Plus:` no codigo sao marcadores internos do fork e ficam como estao.
- `electron/brand.ts` e a unica fonte de nome, pastas, URLs, autor e creditos do upstream (`APP_NAME`, `BRAND_NAME`, `SETTINGS_DIRECTORY`, `DESKTOP_NAME`, `REPOSITORY_URL`, `RELEASES_URL`, `AUTHOR`, `UPSTREAM`). Nao escrever "Moji" nem URLs de repositorio fixos em componentes ou no main.
- Textos traduzidos que nomeiam a app sao sobrepostos em `src/locales/brand/<idioma>.json` (carregados em `src/i18n.ts`). Nao editar os JSON de `src/locales/` do upstream para mudar o nome; strings novas do fork tambem vao para o overlay.
- `npm run verify` corre `scripts/check-branding.cjs`, que falha com textos ou links do Moji original fora das chaves de credito. Corrigir sobrepondo a chave ou usando `brand.ts`, nunca desligando a verificacao.
- Pasta de dados `moji-plus`, `appId` `com.jacbmelo.mojiplus` e `moji-plus.desktop` permitem instalar o Moji Plus ao lado do Moji original. Nao os alterar sem migracao de definicoes.
- Icone e logotipo do fork (D-P1): a marca Markdown "M+" com o M reto a tinta (`#343436`) e o "+" laranja (`#ee7a12`; `#f7953f` no logotipo do tema escuro). Fontes vetoriais em `build/plus/` (`icon.svg`, `icon-small.svg` para 16-32 px, `logo-mark.svg` para o tema escuro, `logo-mark-on-light.svg` para o tema claro, trocado por CSS em `app.css`). Depois de alterar um SVG, correr `npm run icons` para regenerar `build/plus/icon.png`, `build/plus/icons/` e `src/assets/brand/logo-mark*.png`, e fazer commit dos PNG. Os icones do upstream (`build/icon.png`, `build/icons/`, `src/assets/logo-mark-light.png`) ficam sem uso.
- `build/linux/moji.desktop` e `build/metainfo/com.alexishida.moji.metainfo.xml` pertencem ao upstream e nao sao usados; os do fork sao `moji-plus.desktop` e `com.jacbmelo.mojiplus.metainfo.xml`.

## Comportamento proprio do fork

- Barras de scroll no Windows/Linux: ficam transparentes e so aparecem durante o scroll ou com o rato sobre elas, como no macOS. Vive em ficheiros do fork (`src/styles/plus-scrollbars.css`, `src/lib/autoHideScrollbars.ts`), ligados em `src/main.tsx`; nao alterar as regras de scrollbar do `app.css` do upstream para isto.
- Sessao e alteracoes por guardar: ficheiros com alteracoes ficam em rascunho (`settings.autoSave`) e reabrem sempre; `settings.reopenFiles` (novo) reabre tambem os ficheiros sem alteracoes. Os textos das duas opcoes sobrepoem `settingsDialog.autoSave` e acrescentam `settingsDialog.reopenFiles` em `src/locales/brand/`.
- Disposicao da janela: `settings.viewMode` (pre-visualizacao/editor, so gravado com documentos abertos), `settings.outlineVisible` e `settings.windowMaximized` (gravado pelo main) sao restaurados no arranque. Ao contrario do upstream, `previewFluidWidth` tambem persiste (`updateSettings` em `electron/settings.ts`, rever em cada sync).
- Posicao de leitura: por documento, como linha do codigo-fonte (fracionaria) no topo da vista, a mesma coordenada do split view (`src/lib/splitScroll.ts`). Fica em `docScrollRef` no `App.tsx`, vai para `session.documents[].scrollLine` com debounce e ao sair, e e reposta ao ativar o separador.
- Nome sugerido ao guardar um documento novo: slug do `title:` do front matter, do primeiro heading ou da primeira linha (`src/lib/plusFileName.ts`), ligado em `saveDocumentAs` no `App.tsx`. So para documentos sem ficheiro; sem conteudo aproveitavel mantem o titulo do upstream (rever em cada sync).
- Alteracoes externas: `electron/documentWatcher.ts` e `ExternalChangeDialog.tsx`; textos em `externalChange` nos overlays de `src/locales/brand/`.
- Estilo do Markdown (preview e exports): mais minimalista, sem linha por baixo dos H1/H2 e com tabelas a toda a largura, texto menor e so linhas horizontais (sem grelha, fundo no cabecalho nem linhas alternadas); uma tabela mais larga do que a coluna transborda para os dois lados (centrada, sem passar a margem esquerda do painel). Vive em `src/styles/plus-markdown.css`, que sobrepoe `markdown.css` sem o editar; ligado em `src/main.tsx` (depois de `markdown.css`) e em `src/lib/exportHtml.ts` (inlined depois de `markdownCss`), rever em cada sync.
- Tabelas largas no export PDF/PNG: um PDF nao faz scroll, por isso cada tabela mais larga do que a coluna de texto e reduzida com `zoom` ate caber, e em paisagem o texto ocupa a largura toda da folha (classe `plus-export-landscape` em `plus-markdown.css`). Vive em `electron/plusExportFit.ts` (`PRINT_MARGIN_PX` espelha o `@page` do `exportHtml.ts`); ligado em `htmlToPdf` e `htmlToPngFile` do `electron/export.ts`, rever em cada sync.
- Contagem de tokens na status bar: e uma estimativa (caracteres / 4), por isso aparece como `~N` com tooltip. Os textos sobrepoem `statusbar.tokenCount` e acrescentam `statusbar.tokenEstimate` em `src/locales/brand/`; o `title` fica no `StatusBar.tsx` do upstream (rever em cada sync).
- Atualizacoes no macOS: ao contrario do upstream, o macOS tambem verifica as GitHub Releases (`supportsAutomaticUpdates()` em `electron/updater.ts`, rever em cada sync). So verifica: `autoDownload` fica desligado e o aviso abre as Releases, por isso a app nao precisa de ser assinada. Exige o `latest-mac.yml` em cada release.

## Interface alinhada com as Apple HIG

O layout e o aspeto sao os mesmos em macOS, Windows e Linux: as regras do `plus-hig.css` usam `:root[data-platform]` (atributo sempre presente, que mantem a especificidade sobre o `app.css`). So o que existe apenas no Mac fica em `[data-platform='darwin']`: fonte SF, scrollbars nativas, material translucido da sidebar, semaforos e cabecalho proprio da janela de Settings. No Windows e no Linux, onde nao ha barra de menus, o menu da app abre num botao ☰ no canto superior esquerdo (`.plus-app-menu-button`, como na app Claude para Windows), com o mesmo modelo de `src/lib/plusMenu.ts` aberto como popup nativo (`openPlusAppMenu`); os botoes nativos minimizar/maximizar/fechar sao o `titleBarOverlay` com a altura da toolbar (52 px), e a toolbar reserva a largura deles pelas variaveis `env(titlebar-area-*)`. A fonte e Segoe UI Variable no Windows e Inter no Linux. Ficheiros do fork:

- `src/styles/plus-hig.css`: tokens e estilos que sobrepoem `theme.css` e `app.css` sem os editar (fonte do sistema, cores dinamicas, scrollbars nativas, toolbar, separadores, sidebar, sheets, janela de Settings, editor). Nao mudar o `app.css` do upstream para isto.
  No macOS a janela segue o layout do Safari/Finder (macOS 26+): `.app` passa a grelha e `.body` a `display: contents`, para a sidebar ocupar a altura toda (com os semaforos no topo) e a toolbar, os separadores, o documento e a status bar ficarem na coluna ao lado, sobre o fundo claro do conteudo, com os controlos em capsulas. O documento ocupa a coluna desde o topo da janela e passa por baixo da toolbar e da barra de separadores, que sao vidro (`--chrome-glass` com `--chrome-blur`). `.main::before` pode acrescentar por baixo delas uma faixa de esbatimento progressivo com altura `--scroll-edge-h` (agora 0, desligada). Cada scroller (o `.pane` do preview e da Welcome, o `.cm-scroller` do editor) reserva essa altura em `padding-top` e `scroll-padding-top` (`--plus-top-inset` + `--scroll-edge-h`), e `src/lib/plusScrollInset.ts` le-a onde o upstream mede o topo visivel do documento. Depende de a ordem `.topbar`, `.document-tabs`, `.body > .sidebar + .main`, `.statusbar` do `App.tsx` se manter; os overlays sao `position: fixed` e ficam fora da grelha.
- `electron/plusAppearance.ts` + `src/lib/plusAppearance.ts`: cor de acento do sistema (macOS e Windows) em `--system-accent`.
- `src/components/PlusMacToolbar.tsx` (+ `plusIcons.tsx`): toolbar unificada de uma linha no macOS (inclui os botoes de largura total de leitura e de tema claro/escuro). Os comandos que sairam dela (Novo, Abrir, Guardar, Settings, Sobre) vivem na barra de menus. Cada grupo de controlos e `-webkit-app-region: no-drag` por inteiro: so os botoes nao chegava para o macOS lhes entregar os cliques.
- `electron/plusWindow.ts` + `src/lib/plusWindow.ts`: titulo da janela, `setDocumentEdited`, ficheiro representado e documentos recentes; tambem os alertas nativos (`showMessageBox`).
- `electron/plusMenu.ts` + `src/lib/plusMenu.ts`: barra de menus do macOS. O renderer descreve o menu (traduzido) e o main constroi-o; os atalhos que o handler de teclas do `App.tsx` ja trata usam `registerAccelerator: false`, para nao mudar o comportamento. Procurar e substituir usa ⌥⌘F (⌘H e Ocultar) e sair do editor usa ⌃M no Mac (⌘M e Minimizar).
- `electron/plusContextMenu.ts` + `src/lib/plusContextMenu.ts`: menus de contexto nativos (editor, preview, separadores).
- `src/lib/plusDialogs.ts`: alertas nativos de alteracoes por guardar e de alteracoes externas.
- `electron/plusSettingsWindow.ts` + `src/components/PlusSettingsWindow.tsx` + `src/lib/plusSettings.ts`: Settings numa janela propria (`#settings` no mesmo renderer). So pode usar os canais em `SETTINGS_WINDOW_CHANNELS`; cada escrita de settings e reenviada as outras janelas (`IPC.settingsChanged`).
- `src/lib/plusOutlineKeys.ts`: navegacao por setas no outline.
- Textos novos em `plus.*` nos overlays de `src/locales/brand/`.

Ganchos no upstream, a rever em cada sync:

- `src/main.tsx`: imports dos pesos 500-700 da Inter e de `plus-hig.css`, `installSystemAccentColor()`, e o ramo `#settings`.
- `electron/main.ts`: `vibrancy` e `trafficLightPosition` no macOS, `windowBackgroundColor()` transparente no macOS, `isTrustedSender(event, channel)`, os handlers `plus:*` em `registerIpc()`, `installEditContextMenu`, `configureAboutPanel()`, o broadcast em `setSettings` e `loadRenderer()`.
- `electron/shared.ts` / `electron/preload.ts`: canais e metodos `plus:*`.
- `src/App.tsx`: `usePlusSettingsSync`, `usePlusWindowDocument`, `usePlusMenu`; `askUnsaved` e `askExternalChange` chamam os alertas nativos (o `ConfirmDialog` e o `ExternalChangeDialog` ficam por usar); `openSettings` abre a janela; o Export e uma sheet (`.plus-sheet-backdrop`) em vez de substituir o documento.
- `src/components/TopBar.tsx`: o bloco de procura passou para `searchGroup` e o componente devolve sempre `PlusMacToolbar` (a barra de duas linhas do upstream fica por usar).
- `electron/main.ts`: `titleBarOverlay()` com 52 px de altura e as cores do fundo do conteudo.
- `src/components/DocumentTabs.tsx`: o `onContextMenu` chama o menu nativo (o menu HTML fica por usar).
- Geometria de scroll com `plusScrollInset()` (0 fora do macOS): `src/lib/previewScroll.ts` (`getHeadingTopInScroller` e `getActivePreviewHeadingId`), `src/App.tsx` (`origin` das ancoras do split) e `src/components/Editor.tsx` (`topVisibleLine`, `scrollLineToTop` e `EditorView.scrollMargins`). Codigo novo do upstream que meca "o topo do documento visivel" tem de descontar o mesmo inset.
- `src/components/Sidebar.tsx` (`onKeyDown` do `nav`), `Editor.tsx` (`mac: 'Ctrl-m'`), `ExportDialog.tsx` (botao Cancelar, `autoFocus` no Exportar) e `SettingsDialog.tsx` (`macKeys` e simbolos ⌘⇧⌥⌃).

## Creditos (obrigatorio)

- Manter sempre a referencia ao Moji, ao autor Alex Ishida e ao repositorio original: secao "Baseado em" no painel Sobre, secao "History and the original Moji" e "Credits and license" no fim do `README.md` (o README apresenta a app como independente e deixa a historia e as diferencas para o fim), `CREDITS.md`, `LICENSE` (o aviso de copyright original e exigido pela licenca MIT), metainfo e `electron-builder.yml`.
- Os links para o projeto original nos guias de `samples/` sao creditos corretos e ficam como estao.
- Nao divulgar emails no codigo, configuracao ou documentacao do fork. O autor do Moji Plus e identificado pelo perfil do GitHub (https://github.com/jacbmelo) e pelo repositorio; o autor original por https://github.com/alexishida. O check-branding falha se encontrar um endereco de email.

## Versao

- `version` do `package.json` e a versao do Moji Plus, independente da do Moji. `upstreamVersion` regista a versao do Moji em que o build se baseia e e atualizada pelo script de sincronizacao.
- Ao preparar versao: atualizar `version` em `package.json` e `package-lock.json`, o titulo em `src/index.html`, no `README.md` a linha "Current version" e os links diretos de download (Windows `Moji-Plus.Setup.x.y.z.exe`, macOS `Moji-Plus-x.y.z-universal.dmg`, Linux `Moji-Plus-x.y.z-x86_64.AppImage` e `Moji-Plus-x.y.z-amd64.deb`, em `releases/download/vx.y.z/`, com o link para a pagina de GitHub Releases por baixo), uma entrada no `CHANGELOG.md` (`## [x.y.z] - AAAA-MM-DD — based on Moji <upstreamVersion>`) e a `<release>` no metainfo do fork.

## Sincronizacao com o upstream

1. `scripts/sync-upstream.sh`: faz fetch, cria `sync/upstream-<data>` e faz merge de `upstream/main`.
2. Em conflito: manter a `version` do Moji Plus em `package.json`/`package-lock.json`, aceitar o resto do upstream e reaplicar as referencias a `brand.ts`. Depois `git commit --no-edit && scripts/sync-upstream.sh --post`.
3. O passo final atualiza `docs/upstream/` e `upstreamVersion` e corre `npm run verify`. Se o check-branding falhar, acrescentar as chaves novas aos overlays de todos os idiomas.
4. Testar com `npm run dev` e fazer merge do branch no `main`.

`README.md` e `CHANGELOG.md` usam `merge=ours` (`.gitattributes`): as alteracoes do upstream nesses ficheiros nao entram por merge. Ficam em `docs/upstream/` e devem ser revistas para portar o que for relevante.

## Branches

- `main`: Moji Plus.
- Features para propor ao Moji original: branch a partir de `upstream/main` e PR para `alexishida/moji`. Nunca incluir commits de identidade do fork nesses branches.
- Features exclusivas do Moji Plus: branch a partir do `main` e merge no `main`.

## Tags

As tags `vX.Y.Z` sao do Moji Plus. O remote `upstream` usa `tagOpt --no-tags` (ativado por `scripts/sync-upstream.sh`), para as tags do Moji original nao colidirem com as do fork. Os nomes dos ficheiros das releases usam `Moji-Plus` sem espaco, porque o GitHub altera nomes com espacos e o updater deixaria de os encontrar.

## Publicar release

Nao ha CI. Em cada plataforma: `GH_TOKEN=<token com acesso a jacbmelo/Moji> npm run dist:<win|linux|mac> -- --publish always`. O electron-builder cria/atualiza um draft em `jacbmelo/Moji`; criar a tag `vX.Y.Z` e publicar o draft quando Windows, Linux e macOS (incluindo `latest.yml`, `latest-linux.yml` e `latest-mac.yml`) estiverem carregados. Sem o `latest-mac.yml`, a verificacao de atualizacoes no macOS falha. O updater dos builds Moji Plus le apenas as releases de `jacbmelo/Moji`.
