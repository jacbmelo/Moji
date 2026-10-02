// Types and constants shared between the main process, preload, and renderer.

export type Theme = 'light' | 'dark'
/** App-wide appearance: follow the OS or force one theme. */
export type ThemePreference = 'system' | Theme

export function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark'
}

export const SUPPORTED_LANGUAGES = ['en', 'en-GB', 'pt-BR', 'pt-PT', 'es', 'fr', 'de', 'it', 'nl', 'ar', 'hi', 'ja', 'zh', 'zh-TW', 'ru'] as const
export type Language = (typeof SUPPORTED_LANGUAGES)[number]
export const DEFAULT_LANGUAGE: Language = 'en'

export const MARKDOWN_EXTENSIONS = ['.md', '.markdown'] as const

/** Max entries kept in the recent-files list shown on the Welcome screen. */
export const MAX_RECENT_FILES = 3

export const PREVIEW_WIDTH_MIN = 20
export const PREVIEW_WIDTH_MAX = 100
export const PREVIEW_WIDTH_STEP = 5
export const PREVIEW_WIDTH_DEFAULT = 60

/** Editor share of the split view, as a percentage of the workspace width. */
export const SPLIT_RATIO_MIN = 20
export const SPLIT_RATIO_MAX = 80
export const SPLIT_RATIO_DEFAULT = 50

/**
 * Below this workspace width the split view has no room for two readable panes.
 *
 * Measured against the workspace, not the window: the outline sidebar takes 260px of it, so
 * a default 1000px window still fits the split with the outline showing.
 */
export const SPLIT_MIN_WIDTH_PX = 700

/** Delay after the latest edit before an untitled draft is persisted. */
export const AUTO_SAVE_DELAY_MS = 750

export function normalizePreviewWidth(value: unknown, fallback = PREVIEW_WIDTH_DEFAULT): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  const bounded = Math.min(PREVIEW_WIDTH_MAX, Math.max(PREVIEW_WIDTH_MIN, value))
  return Math.round(bounded / PREVIEW_WIDTH_STEP) * PREVIEW_WIDTH_STEP
}

export function normalizeSplitRatio(value: unknown, fallback = SPLIT_RATIO_DEFAULT): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  return Math.round(Math.min(SPLIT_RATIO_MAX, Math.max(SPLIT_RATIO_MIN, value)))
}

export interface Settings {
  /** Theme of the whole app (chrome, editor and preview); exports are always light. */
  appearance: ThemePreference
  language: Language
  previewFontFamily: string
  previewFontSize: number
  /** Source editor font size in px; session-only, like previewFontSize. */
  editorFontSize: number
  previewLineHeight: number
  previewFluidWidth: boolean
  /** Show the live preview beside the source editor while editing. */
  splitView: boolean
  /** Editor share of the split view as a percentage (20-80) of the workspace width. */
  splitRatio: number
  /** Reading column width as a percentage (20-100, in steps of 5) of the available preview area. */
  previewWidth: number
  /** Keep untitled documents and unsaved edits to files as recovery drafts, restored on the next launch. */
  autoSave: boolean
  /** Reopen the files that were open at quit, not just the ones with unsaved edits. */
  reopenFiles: boolean
  /** Tabs open when the app was last used, so the next launch can restore them in order. */
  session?: SessionState
  /** Preview or editor, as it was when the app was last used; restored with the session. */
  viewMode: ViewMode
  /** Show the outline sidebar. */
  outlineVisible: boolean
  /** The window was maximized when last closed. Main's to set: it watches the window itself. */
  windowMaximized?: boolean
  /** Absolute paths of recently opened documents, most-recent first. */
  recentFiles: string[]
  lastDialogDirectory?: string
  windowBounds?: WindowBounds
}

export type ViewMode = 'view' | 'edit'

export interface WindowBounds {
  x?: number
  y?: number
  width: number
  height: number
}

/** Everything known about a document before its bytes are read. */
export interface DocumentMetadata {
  path: string
  /** File size observed immediately before content is read. */
  sizeBytes: number
  sizeProfile: DocumentSizeProfile
}

/**
 * Chunked document delivery over a `MessagePort`. Content crosses the process boundary as UTF-8
 * bytes, so main never materializes the UTF-16 string that `invoke` would have to clone, and its
 * peak memory stays at one chunk instead of the whole file.
 */
export type DocumentStreamMessage =
  | ({ type: 'meta' } & DocumentMetadata)
  | { type: 'chunk'; buffer: ArrayBuffer; byteLength: number }
  | { type: 'end' }
  | { type: 'error'; error: string }

export type DocumentSizeProfile = 'normal' | 'large' | 'very-large'

/**
 * App-managed recovery copy of unsaved work: a document that has no filesystem path yet, or a
 * file's edits that were not saved to it.
 */
export interface AutoSaveDraft {
  id: string
  title: string
  content: string
  /** The file these edits belong to; absent for an untitled document. */
  path?: string
  /** Hash of the file's bytes the edits were made on top of. Set by main, never by the renderer. */
  baseHash?: string
}

/** A draft as handed back at startup. */
export interface RestoredDraft extends AutoSaveDraft {
  /**
   * For a file draft: the file's current text when it still matches `baseHash`, so undoing every
   * edit can be recognised as "back to the saved version". `null` when the file changed or is gone.
   */
  savedContent?: string | null
}

/**
 * One tab of the last session, in tab order. A file carries its path, plus its draft when it had
 * unsaved edits; an untitled document carries only its draft. If the draft never reached the
 * disk, the path still lets the file be reopened.
 */
export interface SessionEntry {
  path?: string
  draftId?: string
  /** Source line (fractional) at the top of the view when the session ended. */
  scrollLine?: number
}

export interface SessionState {
  documents: SessionEntry[]
  activeIndex: number
}

/** Tabs a session may hold; far beyond any real use, it only bounds what settings.json can carry. */
export const MAX_SESSION_DOCUMENTS = 200

/**
 * Why a draft could not be written. Drafts have no size limit of their own: a save is refused only
 * when the machine cannot hold the result, and the refusal always carries the numbers behind it so
 * the renderer can say what is missing instead of showing a raw errno.
 */
export type DraftPersistReason = 'memory-budget' | 'disk-space'

export interface DraftPersistProblem {
  reason: DraftPersistReason
  /** Bytes the write needs, including the headroom kept free. */
  requiredBytes: number
  /** Bytes actually available under that limit. */
  availableBytes: number
}

export type DraftResult =
  | { ok: true }
  | { ok: false; error?: string; problem?: DraftPersistProblem }

/** One splice recorded by the editor, in the coordinates of the text it was produced against. */
export interface DraftEditPayload {
  from: number
  to: number
  insert: string
}

/**
 * Result of journaling edits. `out-of-sync` and `unknown-draft` are not failures: they mean the
 * renderer must fall back to persisting the whole draft.
 */
export type DraftAppendResult =
  | { ok: true }
  | { ok: false; reason: 'out-of-sync' | 'unknown-draft' | 'error'; error?: string; problem?: DraftPersistProblem }

/** Result of an operation that reads/opens a file. */
export type OpenResult =
  | { ok: true; path: string; content: string; sizeBytes: number; sizeProfile: DocumentSizeProfile }
  | { ok: false; canceled?: boolean; error?: string }

/** Result of starting a multi-file open session from the OS dialog. Documents stream in afterward via `openManyProgress`. */
export type OpenDialogResult =
  | { ok: true; sessionId: string; total: number }
  | { ok: false; canceled?: boolean; error?: string }

/**
 * One file finishing (successfully or not) within an open-many session.
 *
 * Only metadata: content crosses the process boundary in exactly one place, the streamed
 * `readPathStream` read every other open already uses. The renderer pulls each file's bytes
 * through that same path once it sees the metadata here, instead of a second copy riding
 * along this push.
 */
export interface OpenManyProgress {
  sessionId: string
  completed: number
  total: number
  document?: DocumentMetadata
  error?: string
}

/** Final summary of an open-many session: natural completion or user cancellation. */
export interface OpenManyDone {
  sessionId: string
  canceled: boolean
  errors: string[]
}

/** How an open document changed on disk behind the app's back. */
export type ExternalChangeKind = 'modified' | 'deleted'

/** Main -> renderer: an open document was changed or removed by another application. */
export interface DocumentChangedEvent {
  path: string
  kind: ExternalChangeKind
}

/** Options for saving over an existing file. */
export interface SaveOptions {
  /** Write even when the file changed on disk since it was read; otherwise the save fails with `conflict`. */
  overwrite?: boolean
}

/** Stages an export passes through, in the order the user sees them. */
export type ExportPhase = 'render' | 'fonts' | 'capture' | 'compress' | 'write'

export interface ExportProgress {
  phase: ExportPhase
  /** PNG only: the slice being captured, 1-based, and how many there are in total. */
  slice?: number
  slices?: number
}

/** Result of a write-style operation (save / export). A save refused with `error: 'conflict'`
 *  means the file changed on disk since it was read; nothing was written. */
export type WriteResult =
  | { ok: true; path: string }
  | { ok: false; canceled?: boolean; error?: string }

export type UpdateStatus =
  | 'unsupported'
  | 'idle'
  | 'checking'
  | 'up-to-date'
  | 'available'
  | 'error'

/** Serializable updater state sent from main to renderer. */
export interface UpdateState {
  status: UpdateStatus
  currentVersion: string
  version?: string
  error?: string
}

export type ExportFormat = 'pdf' | 'html' | 'png'

export type ExportPageSize = 'A4' | 'Letter' | 'Legal'

export type ExportPageOrientation = 'portrait' | 'landscape'

/** Numeric local performance sample. Never carries document content, paths, or user data. */
export interface PerformanceMetric {
  name: string
  durationMs: number
  timestamp: number
  details: Record<string, number>
}

export interface PerformanceReport {
  metrics: PerformanceMetric[]
}

export const EXPORT_PAGE_SIZES: Array<{ value: ExportPageSize; label: string; width: number; height: number }> = [
  { value: 'A4', label: 'A4 (210 x 297 mm)', width: 794, height: 1123 },
  { value: 'Letter', label: 'Letter (8.5 x 11 in)', width: 816, height: 1056 },
  { value: 'Legal', label: 'Legal (8.5 x 14 in)', width: 816, height: 1344 }
]

export interface ExportRequest {
  format: ExportFormat
  pageSize: ExportPageSize
  pageOrientation: ExportPageOrientation
  /** Fully-rendered, standalone HTML document (with inlined CSS). */
  html: string
  /** Base URL for resolving local assets while rendering HTML exports. */
  assetBaseUrl?: string
  /** Suggested base name (without extension) for the save dialog. */
  baseName: string
}

/** PNG generated from one rendered Mermaid diagram in the renderer. */
export interface DiagramPngRequest {
  dataUrl: string
  /** Suggested base name (without extension) for the save dialog. */
  baseName: string
}

/** IPC channel names. */
export const IPC = {
  openDialog: 'file:open-dialog',
  startOpenMany: 'file:open-many-start',
  cancelOpenMany: 'file:open-many-cancel',
  authorizeDroppedPath: 'file:authorize-dropped-path',
  readPathStream: 'file:read-path-stream',
  openLocalPath: 'file:open-local-path',
  readSample: 'file:read-sample',
  save: 'file:save',
  saveAs: 'file:save-as',
  export: 'doc:export',
  cancelExport: 'doc:export-cancel',
  exportDiagramPng: 'diagram:export-png',
  getSettings: 'settings:get',
  setSettings: 'settings:set',
  getDrafts: 'drafts:get',
  saveDraft: 'drafts:save',
  appendDraftEdits: 'drafts:append-edits',
  removeDraft: 'drafts:remove',
  confirmClose: 'app:confirm-close',
  getUpdateState: 'update:get-state',
  checkForUpdate: 'update:check',
  getPerformanceReport: 'performance:get-report',
  /** Renderer -> main: the app-shell effect that listens for pushed documents is mounted. */
  rendererReady: 'app:renderer-ready',
  /** Renderer -> main: end the whole app through the unsaved-changes guard, not just this
   *  window — `window.close()` alone never quits on macOS, where closing the last window
   *  keeps the app running in the dock. */
  requestQuit: 'app:request-quit',
  /** Renderer -> main: the full set of open document paths to watch for external changes. */
  watchDocuments: 'file:watch',
  // main -> renderer push channels
  requestClose: 'app:request-close',
  selectAll: 'app:select-all',
  openDocument: 'doc:open',
  documentChanged: 'file:changed',
  exportProgress: 'doc:export-progress',
  openManyProgress: 'file:open-many-progress',
  openManyDone: 'file:open-many-done',
  updateState: 'update:state',
  fullscreenChanged: 'window:fullscreen-changed'
} as const
