#!/usr/bin/env node
// Moji Plus: gera os PNG do icone e do logotipo a partir dos SVG em build/plus/.
// Uso: npm run icons   (corre este ficheiro dentro do Electron do projeto, sem janela visivel)
const { readFileSync, writeFileSync, mkdirSync } = require('node:fs')
const { join, dirname } = require('node:path')

const root = join(__dirname, '..')
const source = (name) => readFileSync(join(root, 'build/plus', name), 'utf8')

const ICON_SIZES = [16, 24, 32, 48, 64, 128, 256, 512, 1024]
// Abaixo de 48 px usa-se a variante simplificada (moldura mais grossa, sem margem do azulejo).
const SMALL_ICON_MAX = 32
const LOGO_WIDTH = 676

/** Altura proporcional ao viewBox do SVG, para o logotipo nunca ficar deformado. */
function heightFor(svg, width) {
  const [, , w, h] = svg.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number)
  return Math.round((width * h) / w)
}

function outputs() {
  const icon = source('icon.svg')
  const small = source('icon-small.svg')
  const logo = source('logo-mark.svg')
  const logoOnLight = source('logo-mark-on-light.svg')
  return [
    { file: 'build/plus/icon.png', svg: icon, width: 1024, height: 1024 },
    ...ICON_SIZES.map((size) => ({
      file: `build/plus/icons/${size}x${size}.png`,
      svg: size <= SMALL_ICON_MAX ? small : icon,
      width: size,
      height: size
    })),
    // Logotipo do Welcome e do Sobre: tema escuro e tema claro.
    { file: 'src/assets/brand/logo-mark.png', svg: logo, width: LOGO_WIDTH, height: heightFor(logo, LOGO_WIDTH) },
    {
      file: 'src/assets/brand/logo-mark-on-light.png',
      svg: logoOnLight,
      width: LOGO_WIDTH,
      height: heightFor(logoOnLight, LOGO_WIDTH)
    }
  ]
}

async function rasterize(webContents, { svg, width, height }) {
  const dataUrl = await webContents.executeJavaScript(`(async () => {
    const img = new Image()
    img.src = ${JSON.stringify('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg))}
    await img.decode()
    const canvas = document.createElement('canvas')
    canvas.width = ${width}
    canvas.height = ${height}
    canvas.getContext('2d').drawImage(img, 0, 0, ${width}, ${height})
    return canvas.toDataURL('image/png')
  })()`)
  return Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64')
}

async function main() {
  const { app, BrowserWindow } = require('electron')
  await app.whenReady()
  const window = new BrowserWindow({ show: false, webPreferences: { offscreen: true } })
  await window.loadURL('data:text/html,<html><body></body></html>')
  for (const output of outputs()) {
    const path = join(root, output.file)
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, await rasterize(window.webContents, output))
    console.log(`${output.file} (${output.width}x${output.height})`)
  }
  app.quit()
}

if (process.versions.electron) {
  main().catch((error) => {
    console.error(error)
    process.exit(1)
  })
} else {
  // Chamado com node: relancar dentro do Electron do projeto.
  const { spawnSync } = require('node:child_process')
  const env = { ...process.env }
  delete env.ELECTRON_RUN_AS_NODE
  const result = spawnSync(require('electron'), [__filename], { stdio: 'inherit', env })
  process.exit(result.status ?? 1)
}
