// Moji Plus: native context menus (HIG "Context menus") on every platform. The editor and the
// preview get the standard text menu from Chromium's context-menu event; the renderer can pop
// up its own menus (document tabs) and receive the chosen item. See FORK.md.
import { clipboard, Menu, shell, type BrowserWindow, type MenuItemConstructorOptions } from 'electron'
import { sanitizeMenu, toTemplate } from './plusMenu'

const LABEL_KEYS = ['cut', 'copy', 'paste', 'selectAll', 'copyLink', 'openLink', 'copyImage', 'lookUp', 'noGuesses'] as const
type LabelKey = (typeof LABEL_KEYS)[number]

const labels: Record<LabelKey, string> = {
  cut: 'Cut',
  copy: 'Copy',
  paste: 'Paste',
  selectAll: 'Select All',
  copyLink: 'Copy Link',
  openLink: 'Open Link',
  copyImage: 'Copy Image',
  lookUp: 'Look Up “{{text}}”',
  noGuesses: 'No Guesses Found'
}

/** Translations come from the renderer, which owns i18n. */
export function setContextMenuLabels(value: unknown): void {
  if (!value || typeof value !== 'object') return
  for (const key of LABEL_KEYS) {
    const text = (value as Record<string, unknown>)[key]
    if (typeof text === 'string' && text) labels[key] = text.slice(0, 128)
  }
}

function isWebLink(url: string): boolean {
  return /^(https?:|mailto:)/i.test(url)
}

export function installEditContextMenu(win: BrowserWindow): void {
  win.webContents.on('context-menu', (_event, params) => {
    const { editFlags } = params
    const items: MenuItemConstructorOptions[] = []
    const sep: MenuItemConstructorOptions = { type: 'separator' }

    if (params.misspelledWord) {
      const suggestions = params.dictionarySuggestions.slice(0, 5)
      if (suggestions.length === 0) items.push({ label: labels.noGuesses, enabled: false })
      for (const suggestion of suggestions) {
        items.push({ label: suggestion, click: () => win.webContents.replaceMisspelling(suggestion) })
      }
      items.push(sep)
    }

    const selection = params.selectionText.trim()
    if (process.platform === 'darwin' && selection && selection.length <= 40) {
      items.push({ label: labels.lookUp.replace('{{text}}', selection), click: () => win.webContents.showDefinitionForSelection() }, sep)
    }

    if (params.linkURL && isWebLink(params.linkURL)) {
      items.push(
        { label: labels.openLink, click: () => void shell.openExternal(params.linkURL) },
        { label: labels.copyLink, click: () => clipboard.writeText(params.linkURL.replace(/^mailto:/i, '')) },
        sep
      )
    }

    if (params.mediaType === 'image' && params.hasImageContents) {
      items.push({ label: labels.copyImage, click: () => win.webContents.copyImageAt(params.x, params.y) }, sep)
    }

    if (params.isEditable) {
      items.push(
        { role: 'cut', label: labels.cut, enabled: editFlags.canCut },
        { role: 'copy', label: labels.copy, enabled: editFlags.canCopy },
        { role: 'paste', label: labels.paste, enabled: editFlags.canPaste },
        sep,
        { role: 'selectAll', label: labels.selectAll, enabled: editFlags.canSelectAll }
      )
    } else if (selection) {
      items.push({ role: 'copy', label: labels.copy })
    }

    while (items.length > 0 && items[items.length - 1].type === 'separator') items.pop()
    if (items.length > 0) Menu.buildFromTemplate(items).popup({ window: win })
  })
}

/** Pops up a menu the renderer described; resolves with the chosen item's id, or null. */
export function popupRendererMenu(value: unknown, win: BrowserWindow, position?: unknown): Promise<string | null> {
  const at = position as { x?: unknown; y?: unknown } | undefined
  const point = at && Number.isFinite(at.x) && Number.isFinite(at.y) ? { x: Number(at.x), y: Number(at.y) } : {}
  return new Promise((resolve) => {
    let chosen: string | null = null
    const menu = Menu.buildFromTemplate(toTemplate(sanitizeMenu(value), (id) => (chosen = id)))
    menu.popup({ window: win, ...point, callback: () => setImmediate(() => resolve(chosen)) })
  })
}
