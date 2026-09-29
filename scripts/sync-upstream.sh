#!/usr/bin/env bash
# Moji Plus: integra as alteracoes do Moji original (alexishida/Moji) num branch de sincronizacao.
#
#   scripts/sync-upstream.sh           # fetch + merge de upstream/main num branch sync/upstream-<data>
#   scripts/sync-upstream.sh --post    # depois de resolver conflitos e fazer commit do merge
#
# Variavel opcional: UPSTREAM_REF (padrao: upstream/main).
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"
UPSTREAM_REF="${UPSTREAM_REF:-upstream/main}"

require_clean_tree() {
  if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "Ha alteracoes por fazer commit. Faca commit ou stash antes de sincronizar." >&2
    exit 1
  fi
}

# Copias dos documentos originais em docs/upstream/, com caminhos relativos corrigidos.
copy_upstream_docs() {
  local sha
  sha="$(git rev-parse --short "$UPSTREAM_REF")"
  mkdir -p docs/upstream
  {
    echo "<!-- Copia do README do Moji original (https://github.com/alexishida/Moji) em $sha."
    echo "     Nao editar: gerado por scripts/sync-upstream.sh. -->"
    echo
    git show "$UPSTREAM_REF:README.md" \
      | sed -E 's#(src="|\]\()(docs/)#\1../#g; s#(src="|\]\()(src/|\.ai-framework/|openspec/)#\1../../\2#g'
  } > docs/upstream/README.md
  {
    echo "<!-- Copia do CHANGELOG do Moji original (https://github.com/alexishida/Moji) em $sha."
    echo "     Nao editar: gerado por scripts/sync-upstream.sh. -->"
    echo
    git show "$UPSTREAM_REF:CHANGELOG.md"
  } > docs/upstream/CHANGELOG.md
}

update_upstream_version() {
  local version
  version="$(git show "$UPSTREAM_REF:package.json" | node -pe 'JSON.parse(require("fs").readFileSync(0, "utf8")).version')"
  node -e '
    const fs = require("fs")
    const text = fs.readFileSync("package.json", "utf8")
    const next = text.replace(/("upstreamVersion":\s*")[^"]*(")/, `$1${process.argv[1]}$2`)
    if (next === text && !text.includes(`"upstreamVersion": "${process.argv[1]}"`)) {
      console.error("package.json sem campo upstreamVersion"); process.exit(1)
    }
    fs.writeFileSync("package.json", next)
  ' "$version"
  echo "$version"
}

# Pode ser repetido: se o verify falhar, corrigir (ex.: overlays em src/locales/brand/) e voltar a correr.
post_merge() {
  if [[ -f "$(git rev-parse --git-dir)/MERGE_HEAD" ]]; then
    echo "Merge por concluir: resolver conflitos e fazer 'git commit --no-edit' primeiro." >&2
    exit 1
  fi
  copy_upstream_docs
  local version
  version="$(update_upstream_version)"
  npm run verify
  git add -A docs/upstream package.json src/locales/brand
  if git diff --cached --quiet; then
    echo "Nada a atualizar alem do merge."
  else
    git commit -m "chore: registar base Moji $version"
  fi
  echo
  echo "Sincronizado com Moji $version. Rever o branch, testar com 'npm run dev' e fazer merge no main."
  echo "Rever tambem docs/upstream/CHANGELOG.md para acrescentar ao CHANGELOG.md o que for relevante."
}

if [[ "${1:-}" == "--post" ]]; then
  post_merge
  exit 0
fi

require_clean_tree
# README.md e CHANGELOG.md sao do Moji Plus (.gitattributes merge=ours); este driver mantem a nossa versao.
git config merge.ours.driver true
git fetch upstream

branch="sync/upstream-$(date +%Y-%m-%d)"
git switch -c "$branch"

if ! git merge --no-ff --no-edit "$UPSTREAM_REF"; then
  echo
  echo "Conflitos a resolver:" >&2
  git diff --name-only --diff-filter=U >&2
  echo
  echo "Em package.json / package-lock.json manter a 'version' do Moji Plus." >&2
  echo "Depois de resolver: git add <ficheiros> && git commit --no-edit && scripts/sync-upstream.sh --post" >&2
  exit 1
fi

post_merge
