// Moji Plus: native window state that mirrors the active document (see FORK.md).
import type { BrowserWindow } from 'electron'
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
  win.setRepresentedFilename(doc.path && allows(doc.path) ? doc.path : '')
}
