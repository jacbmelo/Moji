#!/usr/bin/env node
// Moji Plus: falha quando um merge do upstream traz textos ou links que ainda identificam a
// app como "Moji" (sem "Plus") ou apontam para o repositorio original fora dos creditos.
// Correcao: sobrepor a chave em `src/locales/brand/<idioma>.json` ou usar `electron/brand.ts`.
const { readdirSync, readFileSync, statSync } = require('node:fs')
const { join, relative } = require('node:path')

const root = join(__dirname, '..')
const localesDir = join(root, 'src/locales')
const brandDir = join(localesDir, 'brand')

// Chaves de credito que citam o Moji original de proposito.
const CREDIT_KEYS = new Set(['aboutDialog.whyNameBody', 'aboutDialog.upstreamBody'])
const UNBRANDED = /\bMoji\b(?! Plus)/

function flatten(object, prefix = '', out = {}) {
  for (const [key, value] of Object.entries(object)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === 'object') flatten(value, path, out)
    else out[path] = value
  }
  return out
}

const problems = []

for (const file of readdirSync(localesDir).filter((name) => name.endsWith('.json'))) {
  const base = flatten(JSON.parse(readFileSync(join(localesDir, file), 'utf8')))
  let overlay = {}
  try {
    overlay = flatten(JSON.parse(readFileSync(join(brandDir, file), 'utf8')))
  } catch {
    problems.push(`src/locales/brand/${file}: overlay em falta`)
  }
  const effective = { ...base, ...overlay }
  for (const [key, value] of Object.entries(effective)) {
    if (CREDIT_KEYS.has(key)) continue
    if (typeof value === 'string' && UNBRANDED.test(value)) {
      problems.push(`src/locales/${file} ${key}: ${JSON.stringify(value)}`)
    }
  }
}

// Links e textos fixos no codigo: o repositorio original so pode aparecer em `brand.ts`.
function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })
}

const sourceFiles = [...walk(join(root, 'electron')), ...walk(join(root, 'src'))].filter((path) =>
  /\.(ts|tsx|html)$/.test(path)
)
for (const path of sourceFiles) {
  const file = relative(root, path)
  if (file === join('electron', 'brand.ts')) continue
  readFileSync(path, 'utf8')
    .split('\n')
    .forEach((line, index) => {
      if (/alexishida/i.test(line) || /['"`>]Moji(?! Plus)\b/.test(line)) {
        problems.push(`${file}:${index + 1}: ${line.trim()}`)
      }
    })
}

// Sem enderecos de email no codigo, configuracao ou documentacao do fork: o autor e
// identificado pelo perfil do GitHub (`AUTHOR.profileUrl` em `brand.ts`).
const EMAIL = /[\w.+-]+@[\w-]+\.[\w.-]+/
const identityFiles = [
  ...sourceFiles,
  ...walk(join(root, 'build')).filter((path) => /\.(xml|desktop)$/.test(path)),
  ...['package.json', 'electron-builder.yml', 'README.md', 'CHANGELOG.md', 'CREDITS.md', 'LICENSE'].map((name) =>
    join(root, name)
  )
]
for (const path of identityFiles) {
  readFileSync(path, 'utf8')
    .split('\n')
    .forEach((line, index) => {
      if (EMAIL.test(line)) problems.push(`${relative(root, path)}:${index + 1}: email: ${line.trim()}`)
    })
}

if (problems.length > 0) {
  console.error('check-branding: referencias ao Moji original fora dos creditos ou emails:\n')
  for (const problem of problems) console.error(`  ${problem}`)
  console.error('\nSobrepor em src/locales/brand/ ou usar electron/brand.ts.')
  process.exit(1)
}
console.log('check-branding: ok')
