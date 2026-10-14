// Moji Plus: native window state that mirrors the active document (see FORK.md).
import { app, type BrowserWindow } from 'electron'
import { APP_NAME } from './brand'

export interface WindowDocument {
  title: string
  path: string | null
  edited: boolean
}

export function sanitizeWindowDocument(value: unknown): WindowDocument | null {
  if (!value || typeof value !== 'object') return null
  const { title, path, edited } = value as Record<string, unknown>
  if (typeof title !== 'string' || typeof edited !== 'boolean') return null
  if (path !== null && typeof path !== 'string') return null
  return { title: title.slice(0, 512), path, edited }
}

/**
 * Window title for Mission Control and the Window menu, the edited dot in the close button, and
 * the represented file on macOS. `allows` keeps the represented file to paths the user opened.
 */
export function applyWindowDocument(win: BrowserWindow, doc: WindowDocument, allows: (path: string) => boolean): void {
  win.setTitle(doc.title || APP_NAME)
  if (process.platform !== 'darwin') return
  win.setDocumentEdited(doc.edited)
  const path = doc.path && allows(doc.path) ? doc.path : ''
  win.setRepresentedFilename(path)
  // Dock menu and Finder's recent items.
  if (path) app.addRecentDocument(path)
}

export interface PlusMessageBox {
  type: 'warning' | 'question' | 'info'
  message: string
  detail?: string
  buttons: string[]
  defaultId: number
  cancelId: number
}

export function sanitizeMessageBox(value: unknown): PlusMessageBox | null {
  if (!value || typeof value !== 'object') return null
  const box = value as Record<string, unknown>
  const buttons = Array.isArray(box.buttons) ? box.buttons.filter((b): b is string => typeof b === 'string').slice(0, 4) : []
  if (typeof box.message !== 'string' || buttons.length === 0) return null
  const index = (n: unknown): number => (typeof n === 'number' && Number.isInteger(n) && n >= 0 && n < buttons.length ? n : 0)
  return {
    type: box.type === 'question' || box.type === 'info' ? box.type : 'warning',
    message: box.message.slice(0, 512),
    detail: typeof box.detail === 'string' ? box.detail.slice(0, 2048) : undefined,
    buttons: buttons.map((b) => b.slice(0, 64)),
    defaultId: index(box.defaultId),
    cancelId: index(box.cancelId)
  }
}
