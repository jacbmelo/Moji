// Moji Plus: the macOS menu bar (HIG "The menu bar"). The renderer owns the translations and
// the state, so it describes the menu and main only builds it: a click on an item with an `id`
// goes back to the renderer as a command. See FORK.md.
import { app, Menu, shell, type BrowserWindow, type MenuItemConstructorOptions } from 'electron'
import { BRAND_NAME, APP_VERSION, AUTHOR, REPOSITORY_URL, UPSTREAM } from './brand'

export type PlusMenuItem =
  | { type: 'separator' }
  | {
      type?: 'normal' | 'checkbox' | 'radio' | 'submenu'
      id?: string
      role?: MenuRole
      label?: string
      accelerator?: string
      /** False: shown in the menu only, the renderer's own key handler answers the keystroke. */
      registerAccelerator?: boolean
      enabled?: boolean
      checked?: boolean
      submenu?: PlusMenuItem[]
    }

/** Native behaviors the renderer may ask for; anything else is dropped. */
const ROLES = [
  'about', 'services', 'hide', 'hideOthers', 'unhide', 'undo', 'redo', 'cut', 'copy', 'paste',
  'pasteAndMatchStyle', 'delete', 'startSpeaking', 'stopSpeaking', 'minimize', 'zoom', 'front',
  'togglefullscreen', 'window', 'help', 'appMenu', 'editMenu', 'windowMenu'
] as const
type MenuRole = (typeof ROLES)[number]

/** Commands main answers itself instead of forwarding them. */
const MAIN_COMMANDS: Record<string, () => void> = {
  'plus:repository': () => void shell.openExternal(REPOSITORY_URL)
}

export function sanitizeMenu(value: unknown, depth = 0): PlusMenuItem[] {
  if (!Array.isArray(value) || depth > 3) return []
  const items: PlusMenuItem[] = []
  for (const raw of value.slice(0, 64)) {
    if (!raw || typeof raw !== 'object') continue
    const item = raw as Record<string, unknown>
    if (item.type === 'separator') {
      items.push({ type: 'separator' })
      continue
    }
    const role = typeof item.role === 'string' && (ROLES as readonly string[]).includes(item.role) ? (item.role as MenuRole) : undefined
    const type = item.type === 'checkbox' || item.type === 'radio' ? item.type : undefined
    items.push({
      type,
      role,
      id: typeof item.id === 'string' ? item.id.slice(0, 128) : undefined,
      label: typeof item.label === 'string' ? item.label.slice(0, 256) : undefined,
      accelerator: typeof item.accelerator === 'string' ? item.accelerator.slice(0, 64) : undefined,
      registerAccelerator: item.registerAccelerator === false ? false : undefined,
      enabled: item.enabled === false ? false : undefined,
      checked: item.checked === true,
      submenu: Array.isArray(item.submenu) ? sanitizeMenu(item.submenu, depth + 1) : undefined
    })
  }
  return items
}

export function toTemplate(items: PlusMenuItem[], send: (id: string) => void): MenuItemConstructorOptions[] {
  const local = (id: string): (() => void) | undefined => MAIN_COMMANDS[id] ?? mainHandlers[id]
  return items.map((item): MenuItemConstructorOptions => {
    if (item.type === 'separator') return { type: 'separator' }
    const { id, submenu, ...rest } = item
    const options: MenuItemConstructorOptions = { ...rest, type: submenu ? 'submenu' : rest.type }
    if (rest.type !== 'checkbox' && rest.type !== 'radio') delete options.checked
    if (submenu) options.submenu = toTemplate(submenu, send)
    if (id && !rest.role) options.click = () => (local(id) ?? (() => send(id)))()
    return options
  })
}

/** Commands main.ts answers (quit through the unsaved-changes guard), keyed by item id. */
let mainHandlers: Record<string, () => void> = {}

/** Builds the application menu the renderer described. No-op outside macOS. */
export function applyPlusMenu(value: unknown, win: BrowserWindow | null, channel: string, handlers: Record<string, () => void>): void {
  if (process.platform !== 'darwin') return
  mainHandlers = handlers
  const send = (id: string): void => {
    if (win && !win.isDestroyed()) win.webContents.send(channel, id)
  }
  Menu.setApplicationMenu(Menu.buildFromTemplate(toTemplate(sanitizeMenu(value), send)))
}

/** The standard About panel, with the credits FORK.md requires. */
export function configureAboutPanel(): void {
  app.setAboutPanelOptions({
    applicationName: BRAND_NAME,
    applicationVersion: APP_VERSION,
    version: `${UPSTREAM.name} ${UPSTREAM.baseVersion}`,
    credits: `${AUTHOR.name} — ${REPOSITORY_URL}\n\nBased on ${UPSTREAM.name} by ${UPSTREAM.author} (${UPSTREAM.license})\n${UPSTREAM.repositoryUrl}`,
    copyright: `${UPSTREAM.license} License`
  })
}
