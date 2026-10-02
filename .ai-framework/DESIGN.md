# Design System

Este arquivo descreve o padrao visual atual do Moji.

Fonte de verdade dos tokens: [`src/styles/theme.css`](../src/styles/theme.css). Componentes e telas devem usar esses tokens antes de criar novas cores, medidas ou variantes.

## Principios

- Leitura primeiro: preview limpo, coluna centralizada e cromo discreto.
- Consistencia por tokens CSS; evitar valores soltos em componentes.
- Tema claro/escuro unico para toda a aplicacao (chrome, editor, modais e preview), seguindo o sistema por padrao; arquivos exportados sempre claros.
- Controles compactos, previsiveis e feitos para uso repetido.
- Reutilizar componentes/classes existentes antes de criar novas variacoes.

## Estrutura

O app Electron usa um shell em camadas:

- **Top bar** (`.topbar`): duas linhas sobre `--chrome-bg`. Primeira linha contem acoes de arquivo (*Novo*, *Abrir*, *Salvar*) e campo de busca com botao de substituicao. Segunda linha contem o seletor segmentado *Preview / Editor / Exportar* e acoes de tema, configuracoes e sobre (icone de informacao). Atalhos globais focam busca/substituicao, alternam paineis ou executam acoes sem mudar o layout.
- **Document tabs** (`.document-tabs`): barra horizontal abaixo da top bar, visivel quando ha documentos abertos. Cada aba tem largura estavel, marcador de alteracao e botao de fechar.
- **Menu de abas** (`.document-tab__menu`): menu contextual compacto acionado por botao iconico na aba ativa; oferece fechar outras abas, fechar abas a direita, fechar salvas e fechar todas.
- **Body** (`.body`): sidebar + area principal.
- **Sidebar** (`.sidebar`): coluna de `--sidebar-w`, visivel com documento aberto. Nos modos preview e editor mostra a arvore de outline gerada dos headings (aninhada por nivel); no preview destaca heading ativo.
- **Main/workspace** (`.main`, `.workspace`): renderiza welcome, preview, editor, dialogo inline de exportacao, painel inline de configuracoes ou painel inline de sobre.
- **Status bar** (`.statusbar`): rodape de `--statusbar-h`. Esquerda mostra a marca; direita mostra o link de guia Markdown (abre o sample embutido no editor com split ativado, codigo-fonte somente leitura a esquerda e preview a direita) e contagens de linhas, tokens e palavras do documento ativo. O guia reutiliza o divisor, a rolagem sincronizada e o limite minimo de largura do split; busca permanece disponivel, com salvar e substituir desabilitados.

## Temas

A preferencia `settings.appearance` aceita `system` (padrao), `light` ou `dark`. O main aplica-a em `nativeTheme.themeSource`, o que tambem ajusta controles nativos; o renderer le o tema resolvido via `prefers-color-scheme` e grava `data-theme="light|dark"` no `<html>` antes do primeiro render.

- `:root` define a paleta escura completa (chrome + leitura).
- `:root[data-theme='light']` redefine todos os tokens de cor para a paleta clara, incluindo `--modal-*`, `--nav-*`, `--segment-*`, scrollbars, `--shadow` e `color-scheme`.
- O botao sol/lua da top bar alterna a aplicacao inteira gravando a escolha explicita; Configuracoes > Geral > Tema oferece Sistema / Claro / Escuro.
- O logo (`logo-mark-light.png`) recebe `filter: invert(1) hue-rotate(180deg)` no tema claro.

O preview usa `data-md-theme` igual ao tema resolvido; a exportacao usa sempre `data-md-theme="light"`, que sobrescreve apenas tokens de leitura sobre a raiz escura:

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

| Token | Valor atual |
|-------|-------------|
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
| `--shadow` | sombra leve para popover de substituicao e dialogos |

## Cores

### Tema escuro (`:root`)

| Token | Valor |
|-------|-------|
| `--bg` | `#1e1e1e` |
| `--bg-elevated` | `#252526` |
| `--bg-inset` | `#2b2b2b` |
| `--text` | `#e7e7e7` |
| `--text-muted` | `#9aa0a6` |
| `--border` | `#3a3a3a` |
| `--border-strong` | `#4a4a4a` |
| `--accent` | `#4c9aff` |
| `--accent-hover` | `#63a9ff` |
| `--accent-contrast` | `#0b1a33` |
| `--code-bg` | `#282c34` |
| `--code-text` | `#abb2bf` |
| `--code-border` | `#3a404b` |
| `--table-header-bg` | `#252526` |
| `--table-stripe-bg` | `#252526` |
| `--danger` | `#ff6b6b` |
| `--brand` | `#6ea8ff` |
| `--sidebar-bg` | `#1a1a1b` |
| `--chrome-bg` | `#202021` |
| `--nav-hover-bg` | `#2a2a2c` |
| `--nav-active-bg` | `#24314a` |
| `--nav-active-text` | `#7cb0ff` |
| `--segment-track` | `#2a2a2c` |
| `--segment-active-bg` | `#38383a` |
| `--scrollbar-track` | `#202021` |
| `--scrollbar-thumb` | `#4c9aff` |
| `--scrollbar-thumb-hover` | `#63a9ff` |

### Tema claro (`:root[data-theme='light']`)

Tokens de leitura iguais aos da tabela `data-md-theme='light'` abaixo, mais:

| Token | Valor |
|-------|-------|
| `--bg-inset` | `#eceff3` |
| `--accent-hover` | `#1f5dd6` |
| `--accent-contrast` | `#ffffff` |
| `--danger` | `#cf222e` |
| `--brand` | `#2f6fed` |
| `--sidebar-bg` | `#f6f7f9` |
| `--chrome-bg` | `#f3f4f6` |
| `--nav-hover-bg` | `#e8ebef` |
| `--nav-active-bg` | `#dde8fc` |
| `--nav-active-text` | `#1f5dd6` |
| `--segment-track` | `#e8ebef` |
| `--segment-active-bg` | `#ffffff` |
| `--scrollbar-track` | `#f3f4f6` |
| `--modal-bg` / `--modal-surface` / `--modal-inset` | `#ffffff` / `#f6f7f9` / `#eceff3` |
| `--modal-text` / `--modal-text-muted` / `--modal-border` | `#1f2328` / `#656d76` / `#d5dae0` |

### Markdown claro (`[data-md-theme='light']`, usado na exportacao)

| Token | Valor |
|-------|-------|
| `--bg` | `#ffffff` |
| `--bg-elevated` | `#f6f7f9` |
| `--text` | `#1f2328` |
| `--text-muted` | `#656d76` |
| `--border` | `#d5dae0` |
| `--border-strong` | `#c2c9d1` |
| `--accent` | `#2f6fed` |
| `--code-bg` | `#f4f6f8` |
| `--code-text` | `#24292f` |
| `--code-border` | `#d8dee4` |
| `--table-header-bg` | `#f8fafc` |
| `--table-stripe-bg` | `#f5f7fa` |
| `--scrollbar-track` | `#f6f7f9` |
| `--scrollbar-thumb` | `#2f6fed` |
| `--scrollbar-thumb-hover` | `#1f5dd6` |

## Componentes

- **Top bar** (`.topbar`): flex column, `--chrome-bg`, ocupa o topo da janela (sem title bar nativa). Espaco vazio arrasta a janela (`-webkit-app-region: drag`); botoes, inputs, grupos e popovers internos usam `no-drag`. A primeira linha reserva espaco para os controles nativos: `--traffic-lights-w` a esquerda no macOS (removido em fullscreen via `data-fullscreen`) e a largura do overlay (`env(titlebar-area-*)`) a direita no Windows/Linux.
- **Botoes de arquivo** (`.filegroup`, `.filegroup__btn`): altura 30px, icone + texto, borda `--border`, hover em `--bg-inset`.
- **Busca/substituicao** (`.topbar__search`, `.topbar__replace-popover`): busca segue altura de 30px, fundo `--bg`, borda `--border` e tipografia de 13px. Ao buscar no preview, popover compacto mostra ocorrencia atual/total e navegacao anterior/proxima. No editor, mesmo popover mostra input de destino e contador; navegacao anterior/proxima ocupa uma linha propria, seguida por linha de substituir uma ocorrencia ou substituir todas. Match ativo usa amarelo com contorno; demais matches permanecem na cor accent.
- **Segment** (`.segment`, `.segment__btn`): trilho `--segment-track`, botoes de 30px, ativo em `--segment-active-bg`.
- **Icon button** (`.iconbtn`): 34x34px, sem borda visivel por padrao, hover em `--bg-inset`, ativo com `--accent`.
- **Tamanho da fonte** (`.font-size-control`, `.font-size-popover`): botao iconico antes do tema, disponivel na leitura e no editor. Abre popover compacto com acoes de diminuir/aumentar, restaurar o padrao (16px no preview, 14px no editor) e valor atual entre 12px e 24px. Preview e editor tem tamanhos separados; no split view o controlo segue o painel tocado por ultimo. O tamanho e guardado nas definicoes e mantem-se entre sessoes.
- **Largura da leitura** (`.markdown-body--fluid`): o painel de configuracoes define a largura de leitura em porcentagem (20-100%, passos de 5%, persistido, padrao 60%), aplicada via `--reading-width` no elemento; o preview mantem piso legivel de `--reading-width-min`, limitado ao espaco disponivel em janelas estreitas. Botao iconico disponivel somente no preview alterna entre a largura configurada e a largura total do painel. Estado ativo usa `--accent`; no Moji Plus a alternancia persiste e e restaurada no arranque, como o modo e os topicos.
- **Document tabs** (`.document-tabs`, `.document-tab`): altura 35px; aba ativa usa `--bg` e filete superior `--accent`; marcador de dirty usa `--accent`; menu da aba ativa usa popover em `--bg-elevated`, borda `--border`, sombra `--shadow` e acoes compactas de 30px.
- **Sidebar / outline** (`.sidebar`, `.outline-tree`, `.outline-item`): outline aparece nos modos preview e editor como arvore aninhada por nivel de heading. Cada grupo (`.outline-tree__children`) tem linha-guia vertical `--border`. Headings com filhos sao colapsaveis por chevron; botao no topo do painel (`.outline-head__toggle`) expande/colapsa tudo. Prefixos `Requirement:`/`Scenario:` viram icones (`IconBlock`/`IconFlow`) e saem do texto; Requirement usa peso maior e `--text`, Scenario recua com `--text-muted`. Titulos longos quebram em ate 2 linhas com `title` completo no hover. Item ativo usa `--nav-active-text`, fundo tenue `--nav-active-bg` e barra `inset 2px --accent`. No preview, item ativo acompanha rolagem via scroll-spy (`getActivePreviewHeadingId` em `src/lib/previewScroll.ts`); clicar rola suavemente ate heading. No editor, clicar move cursor e rolagem para linha Markdown do heading.
- **Preview** (`.markdown-body`): largura `--reading-width` (porcentagem configurada no painel, padrao 60%), com piso responsivo `--reading-width-min`, ou `--reading-width-fluid` quando o alternador da top bar esta ativo; padding `--space-6 --space-5`, tipografia configuravel pelo painel de configuracoes (padrao 16px, linha 1.7), headings com hierarquia clara e codigo em `--code-bg`. Blocos de codigo usam `.code-block` e exibem `.code-copy-button` no hover/foco; botao some durante selecao de texto.
- **Modais e dialogos**: todos usam o chrome do tema ativo com `--modal-bg`/`--modal-surface`, borda `--modal-border`, raio `--radius` e sombra `--shadow`. Cabecalho compacto tem titulo claro, icone neutro e fechar separado das acoes; botoes iconicos mantem cor neutra e usam hover/foco previsivel. Alcas invisiveis e cursores permitem redimensionar por quatro bordas e quatro cantos; tamanho minimo e limites da janela evitam perda de conteudo, e alcas de esquerda/cima preservam borda oposta. Backdrop, quando existir, escurece fundo e fecha somente em fluxos seguros.
- **Visualizador Mermaid** (`.diagram-modal`): especializacao do padrao de modal. Clique no diagrama abre area de trabalho pontilhada no tema atual do preview e SVG Mermaid na paleta clara/escura correspondente. Cabecalho: nome do diagrama a esquerda; navegacao central compacta `< atual/total >`, com setas neutras e grossas; acoes a direita. Controles de zoom sao `−`, seletor com niveis fixos de 10% a 1000%, `+` e *Fit to view*. Download PNG fica separado por espaco pequeno e fechar por espaco maior. Pan e livre por arraste; `Escape` ou clique no backdrop fecham o modal. O minimapa aparece somente acima de 100%, representa diagrama + viewport + margem de canvas, e aceita clique/arraste horizontal e vertical. Download sugere `arquivo-nome-do-diagrama-n.png`.
- **Editor** (`.editor-pane`, `.cm-editor`): ocupa toda a area principal, fonte mono 14px, line wrapping e tema CodeMirror do tema ativo (One Dark Pro no escuro, GitHub light no claro). Keymap inclui acoes de Markdown para negrito, italico, link, lista, checklist e bloco de codigo.
- **Export dialog** (`.export-dialog`): dialogo inline centralizado, largura `min(760px, calc(100vw - 32px))`, lista de formatos PDF/HTML/PNG, configuracoes de pagina para PDF.
- **Settings dialog** (`.settings-dialog`): painel inline centralizado no mesmo padrao do export, largura maxima 680px. Abas (`.settings-tabs`) separam Geral (idioma, tema Sistema/Claro/Escuro, manter documentos novos e alteracoes por guardar entre sessoes, reabrir os ficheiros abertos ao iniciar), Preview, Editor e Atalhos. Cada grupo (`.settings-section`) e um cartao em `--bg-elevated` com cabecalho (`.settings-section__heading`) em `--bg-inset`; Geral e Preview usam campos empilhados (`.settings-field`) separados por filete `--border`, rotulo a esquerda e controle de 36px a direita. Atalhos usam grade de duas colunas (`.settings-shortcuts`), reduzida a uma em telas estreitas, com teclas em `.settings-shortcut__key`. Idiomas embarcados atuais: English, Portugues (Brasil), Espanol, Japones, Chines e Russo.
- **About dialog** (`.about-dialog`): painel inline centralizado que reutiliza a estrutura de `.export-dialog`; mostra nome do app, versao (de `package.json`), autor, e-mail, link do repositorio e a explicacao do nome. Rodape (`.about-dialog__update`) exibe estado do updater e botao com icone para procurar atualizacoes. Aberto pelo botao de informacao na top bar.
- **Confirm dialog** (`.dialog`): modal com backdrop, largura `min(420px, 90vw)`, usado para alteracoes nao salvas. `.dialog__actions` quebra linha (`flex-wrap`) quando os botoes nao cabem.
- **External change dialog** (`ExternalChangeDialog`, reutiliza `.dialog`): avisa que o ficheiro foi alterado noutra aplicacao, removido, ou mudou no disco antes de guardar. Acoes conforme o caso: Manter/Cancelar (tambem por `Escape` ou clique no backdrop), Recarregar ou Guardar, Substituir (so no conflito ao guardar) e Guardar como… como acao primaria.
- **Notice** (`.notice`): toast inferior sobre a status bar; erro usa `--danger`.
- **Update notice** (`.update-notice`): cartao compacto fixo acima da status bar, com estados de versao disponivel, progresso, reinicio e erro. Usa apenas tokens existentes, barra de progresso com `--accent` e erro com `--danger`.
- **Button** (`.btn`, `.btn--primary`): botao padrao de acao usado no welcome. `.btn` tem borda `--border` e fundo `--bg-elevated`; `.btn--primary` usa `--accent`. Aceita icone + texto.
- **Welcome** (`.welcome`): tela vazia centralizada exibida sem documento aberto. Empilha logo (`.welcome__logo`, `src/assets/logo-mark-light.png`), tagline (`.welcome__tagline`), titulo (`.welcome__title`), acoes de abrir/criar (`.welcome__actions` com `.btn`/`.btn--primary`), dica de arrastar arquivo (`.welcome__hint`) e lista de arquivos recentes quando existir.
- **Arquivos recentes** (`.welcome__recent`): cartao opcional de largura maxima 480px, com fundo `--bg-elevated`, borda `--border`, raio `--radius` e padding `--space-3`. Lista documentos abertos recentemente (persistidos em `settings.recentFiles`, limite `MAX_RECENT_FILES`). Cada linha (`.welcome__recent-item`) tem botao de abrir (`.welcome__recent-open`: icone, nome do arquivo e caminho truncado) e botao de remover (`.welcome__recent-remove`, visivel no hover). So aparece quando ha entradas.
- **Drop overlay** (`.drop-overlay`): sobreposicao em tela cheia ao arrastar arquivo Markdown para a janela.

## Markdown Renderizado

O preview deve manter suporte visual para:

- headings com anchors
- links
- listas e task lists
- tabelas com overflow horizontal
- front matter YAML no topo do documento como bloco de codigo `pre.hljs.front-matter` com highlight YAML
- blockquotes
- codigo inline e blocos com highlight.js
- botao de copiar em blocos de codigo, oculto durante selecao do bloco
- diagramas Mermaid renderizados no tema atual, clicaveis para abrir o visualizador `.diagram-modal`
- imagens responsivas
- destaque de busca via `.search-highlight` quando a busca estiver conectada

## Responsividade

- Janela minima atual: 640x480.
- Export dialog vira uma coluna abaixo de 720px.
- Grade de atalhos das configuracoes vira uma coluna abaixo de 720px.
- Texto em abas e nome de arquivo deve truncar com ellipsis; no outline, headings longos quebram em ate 2 linhas.
- Controles fixos nao devem mudar dimensao com hover, foco, dirty marker ou labels longos.

## Acessibilidade

- Contraste minimo AA para texto principal em temas claro e escuro.
- Alvos clicaveis principais com 30px ou mais.
- Estados hover/foco devem ser visiveis.
- Botoes iconicos precisam de `title` ou `aria-label`.
- Acoes principais ficam acessiveis pela top bar com `title` ou `aria-label` nos botoes iconicos.
