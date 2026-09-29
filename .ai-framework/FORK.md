# Regras do fork Moji Plus

Moji Plus e uma versao derivada do Moji de Alex Ishida (https://github.com/alexishida/Moji, MIT), mantida em https://github.com/jacbmelo/Moji. Estas regras complementam `.ai-framework/RULES.md`; em caso de conflito, prevalecem as daqui.

## Principio

Alterar o minimo possivel em ficheiros vindos do upstream, para que cada merge de `upstream/main` gere poucos conflitos. A identidade do fork fica concentrada em ficheiros proprios.

## Identidade

- `electron/brand.ts` e a unica fonte de nome, pastas, URLs, autor e creditos do upstream (`APP_NAME`, `SETTINGS_DIRECTORY`, `DESKTOP_NAME`, `REPOSITORY_URL`, `RELEASES_URL`, `AUTHOR`, `UPSTREAM`). Nao escrever "Moji" nem URLs de repositorio fixos em componentes ou no main.
- Textos traduzidos que nomeiam a app sao sobrepostos em `src/locales/brand/<idioma>.json` (carregados em `src/i18n.ts`). Nao editar os JSON de `src/locales/` do upstream para mudar o nome; strings novas do fork tambem vao para o overlay.
- `npm run verify` corre `scripts/check-branding.cjs`, que falha com textos ou links do Moji original fora das chaves de credito. Corrigir sobrepondo a chave ou usando `brand.ts`, nunca desligando a verificacao.
- Pasta de dados `moji-plus`, `appId` `com.jacbmelo.mojiplus` e `moji-plus.desktop` permitem instalar o Moji Plus ao lado do Moji original. Nao os alterar sem migracao de definicoes.
- Icone e logotipo do fork: fontes vetoriais em `build/plus/` (`icon.svg`, `icon-small.svg` para 16-32 px, `logo-mark.svg` para o tema escuro, `logo-mark-on-light.svg` para o tema claro, trocado por CSS em `app.css`). Depois de alterar um SVG, correr `npm run icons` para regenerar `build/plus/icon.png`, `build/plus/icons/` e `src/assets/brand/logo-mark*.png`, e fazer commit dos PNG. Os icones do upstream (`build/icon.png`, `build/icons/`, `src/assets/logo-mark-light.png`) ficam sem uso.
- `build/linux/moji.desktop` e `build/metainfo/com.alexishida.moji.metainfo.xml` pertencem ao upstream e nao sao usados; os do fork sao `moji-plus.desktop` e `com.jacbmelo.mojiplus.metainfo.xml`.

## Creditos (obrigatorio)

- Manter sempre a referencia ao Moji, ao autor Alex Ishida e ao repositorio original: secao "Baseado em" no painel Sobre, bloco no topo do `README.md`, `CREDITS.md`, `LICENSE` (o aviso de copyright original e exigido pela licenca MIT), metainfo e `electron-builder.yml`.
- Os links para o projeto original nos guias de `samples/` sao creditos corretos e ficam como estao.
- Nao divulgar emails no codigo, configuracao ou documentacao do fork. O autor do Moji Plus e identificado pelo perfil do GitHub (https://github.com/jacbmelo) e pelo repositorio; o autor original por https://github.com/alexishida. O check-branding falha se encontrar um endereco de email.

## Versao

- `version` do `package.json` e a versao do Moji Plus, independente da do Moji. `upstreamVersion` regista a versao do Moji em que o build se baseia e e atualizada pelo script de sincronizacao.
- Ao preparar versao: atualizar `version` em `package.json` e `package-lock.json`, o titulo em `src/index.html`, a versao no `README.md`, uma entrada no `CHANGELOG.md` (`## [x.y.z] - AAAA-MM-DD — based on Moji <upstreamVersion>`) e a `<release>` no metainfo do fork.

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

## Publicar release

Nao ha CI. Em cada plataforma: `GH_TOKEN=<token com acesso a jacbmelo/Moji> npm run dist:<win|linux|mac> -- --publish always`. O electron-builder cria/atualiza um draft em `jacbmelo/Moji`; criar a tag `vX.Y.Z` e publicar o draft quando Windows e Linux (incluindo `latest.yml`/`latest-linux.yml`) estiverem carregados. O updater dos builds Moji Plus le apenas as releases de `jacbmelo/Moji`.
