import { watch, type FSWatcher } from 'node:fs'
import { readFile, stat } from 'node:fs/promises'
import { createHash, type Hash } from 'node:crypto'
import { basename, dirname } from 'node:path'
import type { DocumentChangedEvent } from './shared'

/** Editors save in bursts (truncate + write, or temp file + rename); one check per burst. */
const CHANGE_DEBOUNCE_MS = 200

/** The version of a document the renderer is known to hold. */
export interface DocumentSnapshot {
  size: number
  mtimeMs: number
  hash: string
}

/** Hash of a document's bytes on disk; the stream read and the save both feed it the same bytes. */
export function contentHash(): Hash {
  return createHash('sha256')
}

interface DirectoryWatch {
  watcher: FSWatcher
  /** Watched file names inside this directory, mapped to their full path. */
  names: Map<string, string>
}

/**
 * Tells the renderer when an open document changes or disappears on disk.
 *
 * Each directory holding an open document is watched, not the file itself: an atomic save
 * (write a temp file, rename it over the original) replaces the inode, and a watch on the
 * file would silently stop firing after the first one. `fs.watch` is not reliable everywhere
 * (network shares, some Linux setups), so `checkAll` is also run when the window regains focus.
 *
 * Only a real content change is reported: an event whose bytes hash the same as the known
 * version (a `touch`, or this app's own save) just refreshes the snapshot.
 */
export class DocumentWatcher {
  private readonly baselines = new Map<string, DocumentSnapshot>()
  /** Last disk state reported per path, so the same change is never announced twice. */
  private readonly lastNotified = new Map<string, string>()
  private readonly directories = new Map<string, DirectoryWatch>()
  private readonly timers = new Map<string, NodeJS.Timeout>()
  private watched = new Set<string>()

  constructor(private readonly notify: (event: DocumentChangedEvent) => void) {}

  setBaseline(filePath: string, snapshot: DocumentSnapshot): void {
    this.baselines.set(filePath, snapshot)
    this.lastNotified.delete(filePath)
  }

  /** Replaces the set of watched documents. */
  watch(paths: readonly string[]): void {
    const next = new Set(paths)
    for (const filePath of this.watched) {
      if (!next.has(filePath)) this.unwatchPath(filePath)
    }
    for (const filePath of next) {
      if (!this.watched.has(filePath)) this.watchPath(filePath)
    }
    this.watched = next
  }

  /** Re-checks every watched document; the fallback for when `fs.watch` missed an event. */
  async checkAll(): Promise<void> {
    await Promise.all([...this.watched].map((filePath) => this.check(filePath)))
  }

  /**
   * True when the file on disk no longer matches the version the renderer holds, so a save
   * would silently overwrite someone else's change. A file that is gone has nothing to lose.
   */
  async diverged(filePath: string): Promise<boolean> {
    const baseline = this.baselines.get(filePath)
    if (!baseline) return false
    const current = await this.readSnapshot(filePath, baseline)
    return current !== 'deleted' && current.hash !== baseline.hash
  }

  close(): void {
    for (const timer of this.timers.values()) clearTimeout(timer)
    this.timers.clear()
    for (const entry of this.directories.values()) entry.watcher.close()
    this.directories.clear()
    this.watched.clear()
  }

  private watchPath(filePath: string): void {
    const directory = dirname(filePath)
    const name = basename(filePath)
    const existing = this.directories.get(directory)
    if (existing) {
      existing.names.set(name, filePath)
      return
    }
    try {
      const watcher = watch(directory, { persistent: false }, (_event, changed) => {
        // Some platforms omit the file name; then every document in the directory is checked.
        const entry = this.directories.get(directory)
        if (!entry) return
        const paths = changed ? [entry.names.get(changed.toString())] : [...entry.names.values()]
        for (const changedPath of paths) {
          if (changedPath) this.schedule(changedPath)
        }
      })
      watcher.on('error', () => {
        watcher.close()
        this.directories.delete(directory)
      })
      this.directories.set(directory, { watcher, names: new Map([[name, filePath]]) })
    } catch {
      // Unwatchable directory (network share, permissions): focus checks still cover it.
    }
  }

  private unwatchPath(filePath: string): void {
    const directory = dirname(filePath)
    const entry = this.directories.get(directory)
    const timer = this.timers.get(filePath)
    if (timer) clearTimeout(timer)
    this.timers.delete(filePath)
    if (!entry) return
    entry.names.delete(basename(filePath))
    if (entry.names.size === 0) {
      entry.watcher.close()
      this.directories.delete(directory)
    }
  }

  private schedule(filePath: string): void {
    const pending = this.timers.get(filePath)
    if (pending) clearTimeout(pending)
    this.timers.set(filePath, setTimeout(() => {
      this.timers.delete(filePath)
      void this.check(filePath)
    }, CHANGE_DEBOUNCE_MS))
  }

  private async check(filePath: string): Promise<void> {
    const baseline = this.baselines.get(filePath)
    if (!baseline || !this.watched.has(filePath)) return
    let current: DocumentSnapshot | 'deleted'
    try {
      current = await this.readSnapshot(filePath, baseline)
    } catch {
      // Locked or unreadable mid-write: the next event or focus check tries again.
      return
    }
    if (current !== 'deleted' && current.hash === baseline.hash) {
      // Same bytes (a `touch`, or the file coming back unchanged): nothing to announce.
      this.setBaseline(filePath, current)
      return
    }
    const state = current === 'deleted' ? 'deleted' : current.hash
    if (this.lastNotified.get(filePath) === state) return
    this.lastNotified.set(filePath, state)
    this.notify({ path: filePath, kind: current === 'deleted' ? 'deleted' : 'modified' })
  }

  /** Current disk state; content is only read when size or mtime moved away from `baseline`. */
  private async readSnapshot(filePath: string, baseline: DocumentSnapshot): Promise<DocumentSnapshot | 'deleted'> {
    let fileStat
    try {
      fileStat = await stat(filePath)
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') return 'deleted'
      throw err
    }
    if (!fileStat.isFile()) return 'deleted'
    if (fileStat.size === baseline.size && fileStat.mtimeMs === baseline.mtimeMs) return baseline
    const bytes = await readFile(filePath)
    return {
      size: fileStat.size,
      mtimeMs: fileStat.mtimeMs,
      hash: createHash('sha256').update(bytes).digest('hex')
    }
  }
}
