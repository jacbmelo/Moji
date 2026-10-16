// Moji Plus: describes the macOS menu bar (electron/plusMenu.ts builds it). Shortcuts that the
// app's own keydown handler already answers are only displayed (`registerAccelerator: false`),
// so key handling stays exactly as it is; the rest are native roles or menu-owned commands.
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { BRAND_NAME } from '../../electron/brand'
import type { PlusMenuItem } from '../../electron/plusMenu'
import type { ExportFormat, ThemePreference } from '../../electron/shared'
import { useContextMenuLabels } from './plusContextMenu'

export interface PlusMenuState {
  hasDoc: boolean
  readOnly: boolean
  /** The active document has changes to save. */
  dirty: boolean
  mode: 'view' | 'edit'
  documentCount: number
  splitView: boolean
  canToggleSplit: boolean
  outlineVisible: boolean
  canToggleOutline: boolean
  fluidWidth: boolean
  canToggleFluidWidth: boolean
  canAdjustFontSize: boolean
  canReplace: boolean
  appearance: ThemePreference
  recentFiles: string[]
}

export interface PlusMenuActions {
  newDocument: () => void
  selectAll: () => void
  open: () => void
  openRecent: (path: string) => void
  clearRecent: () => void
  close: () => void
  save: () => void
  saveAs: () => void
  export: (format: ExportFormat) => void
  settings: () => void
  checkForUpdates: () => void
  find: () => void
  replace: () => void
  findNext: () => void
  findPrevious: () => void
  setMode: (mode: 'view' | 'edit') => void
  toggleMode: () => void
  toggleSplit: () => void
  toggleOutline: () => void
  toggleFluidWidth: () => void
  fontReset: () => void
  fontIn: () => void
  fontOut: () => void
  setAppearance: (appearance: ThemePreference) => void
  nextTab: () => void
  previousTab: () => void
  guide: () => void
  /** Windows and Linux: the About panel lives in the app (the Mac uses the standard one). */
  about: () => void
}

const shown = { registerAccelerator: false } as const
const sep = { type: 'separator' } as const

function fileName(path: string): string {
  return path.split(/[\\/]/).pop() || path
}

/** The menu and the dispatcher of the window, for the app menu button (Windows and Linux). */
let appMenu: PlusMenuItem[] = []
let dispatchMenuCommand: (id: string) => void = () => {}

/**
 * Windows and Linux: opens the app menu below `anchor` as a native popup, the way the Claude
 * desktop app does, since those windows have no menu bar.
 */
export async function openPlusAppMenu(anchor: HTMLElement): Promise<void> {
  const rect = anchor.getBoundingClientRect()
  const id = await window.api.showContextMenu(appMenu, { x: Math.round(rect.left), y: Math.round(rect.bottom + 4) })
  if (id) dispatchMenuCommand(id)
}

/** Runs a menu command from elsewhere in the window (the toolbar's close button). */
export function runPlusMenuCommand(id: string): void {
  dispatchMenuCommand(id)
}

export function usePlusMenu(state: PlusMenuState, actions: PlusMenuActions): void {
  const appName = BRAND_NAME
  const mac = window.api.platform === 'darwin'
  const { t, i18n } = useTranslation()
  useContextMenuLabels()
  const actionsRef = useRef(actions)
  actionsRef.current = actions
  const recentRef = useRef(state.recentFiles)
  recentRef.current = state.recentFiles
  const fullscreen = document.documentElement.hasAttribute('data-fullscreen')

  const m = (key: string): string => t(`plus.menu.${key}`, { name: appName })
  const doc = state.hasDoc
  /** Shown accelerator: Cmd on the Mac, Ctrl elsewhere. */
  const key = (chord: string): string => chord.replace('Mod', mac ? 'Cmd' : 'Ctrl')

  const fileMenu: PlusMenuItem = {
    label: m('file'),
    submenu: [
      { id: 'newDocument', label: m('new'), accelerator: key('Mod+N'), ...shown },
      { id: 'open', label: m('open'), accelerator: key('Mod+O'), ...shown },
      {
        label: m('openRecent'),
        enabled: state.recentFiles.length > 0,
        submenu: [
          ...state.recentFiles.map((path, index) => ({ id: `openRecent:${index}`, label: fileName(path) })),
          sep,
          { id: 'clearRecent', label: m('clearRecent'), enabled: state.recentFiles.length > 0 }
        ]
      },
      sep,
      { id: 'close', label: m('close'), accelerator: key('Mod+W'), ...shown, enabled: doc },
      // Only enabled with something to save, as in macOS document apps; Save As stays available.
      { id: 'save', label: m('save'), accelerator: key('Mod+S'), ...shown, enabled: doc && !state.readOnly && state.dirty },
      { id: 'saveAs', label: m('saveAs'), accelerator: key('Shift+Mod+S'), ...shown, enabled: doc },
      sep,
      {
        label: m('export'),
        enabled: doc,
        submenu: [
          { id: 'export:pdf', label: m('exportPdf'), accelerator: key('Shift+Mod+E'), ...shown },
          { id: 'export:html', label: m('exportHtml') },
          { id: 'export:png', label: m('exportPng') }
        ]
      },
      // Windows and Linux have no app menu: Settings and Exit close the File menu there.
      ...(mac
        ? []
        : [
            sep,
            { id: 'settings', label: m('settings'), accelerator: 'Ctrl+,', ...shown },
            sep,
            { id: 'quit', label: m('exit'), accelerator: 'Ctrl+Q', ...shown }
          ])
    ]
  }

  const editMenu: PlusMenuItem = {
    label: m('edit'),
    submenu: [
      { role: 'undo', label: m('undo') },
      { role: 'redo', label: m('redo') },
      sep,
      { role: 'cut', label: m('cut') },
      { role: 'copy', label: m('copy') },
      { role: 'paste', label: m('paste') },
      ...(mac ? [{ role: 'pasteAndMatchStyle' as const, label: m('pasteAndMatchStyle') }] : []),
      { role: 'delete', label: m('delete') },
      // The app scopes Select All to the document instead of the whole window.
      { id: 'selectAll', label: m('selectAll'), accelerator: key('Mod+A'), ...(mac ? {} : shown) },
      sep,
      {
        label: m('find'),
        submenu: [
          { id: 'find', label: m('findEllipsis'), accelerator: key('Mod+F'), ...shown, enabled: doc },
          // Cmd+H belongs to Hide on the Mac, so Replace takes the standard Option-Cmd-F there.
          mac
            ? { id: 'replace', label: m('findAndReplace'), accelerator: 'Alt+Cmd+F', enabled: state.canReplace }
            : { id: 'replace', label: m('findAndReplace'), accelerator: 'Ctrl+H', ...shown, enabled: state.canReplace },
          { id: 'findNext', label: m('findNext'), accelerator: key('Mod+G'), ...shown, enabled: doc },
          { id: 'findPrevious', label: m('findPrevious'), accelerator: key('Shift+Mod+G'), ...shown, enabled: doc }
        ]
      },
      ...(mac
        ? [
            sep,
            {
              label: m('speech'),
              submenu: [
                { role: 'startSpeaking' as const, label: m('startSpeaking') },
                { role: 'stopSpeaking' as const, label: m('stopSpeaking') }
              ]
            }
          ]
        : [])
    ]
  }

  const viewMenu: PlusMenuItem = {
    label: m('view'),
    submenu: [
      { id: 'mode:view', type: 'radio', label: m('preview'), checked: doc && state.mode === 'view', enabled: doc },
      { id: 'mode:edit', type: 'radio', label: m('editor'), checked: doc && state.mode === 'edit', enabled: doc },
      { id: 'toggleMode', label: m('toggleMode'), accelerator: key('Mod+E'), ...shown, enabled: doc },
      { id: 'toggleSplit', type: 'checkbox', label: m('livePreview'), accelerator: key('Mod+\\'), ...shown, checked: state.splitView, enabled: state.canToggleSplit },
      sep,
      {
        id: 'toggleOutline',
        label: state.outlineVisible ? m('hideSidebar') : m('showSidebar'),
        ...(mac ? { accelerator: 'Ctrl+Cmd+S' } : {}),
        enabled: state.canToggleOutline
      },
      { id: 'toggleFluidWidth', type: 'checkbox', label: m('fullWidth'), checked: state.fluidWidth, enabled: state.canToggleFluidWidth },
      sep,
      { id: 'fontReset', label: m('actualSize'), accelerator: key('Mod+0'), ...shown, enabled: state.canAdjustFontSize },
      { id: 'fontIn', label: m('zoomIn'), accelerator: key('Mod+Plus'), ...shown, enabled: state.canAdjustFontSize },
      { id: 'fontOut', label: m('zoomOut'), accelerator: key('Mod+-'), ...shown, enabled: state.canAdjustFontSize },
      sep,
      {
        label: m('appearance'),
        submenu: (['system', 'light', 'dark'] as const).map((value) => ({
          id: `appearance:${value}`,
          type: 'radio' as const,
          label: m(`appearance_${value}`),
          checked: state.appearance === value
        }))
      },
      sep,
      { role: 'togglefullscreen', label: fullscreen ? m('exitFullScreen') : m('enterFullScreen') }
    ]
  }

  const windowMenu: PlusMenuItem = {
    ...(mac ? { role: 'window' as const } : {}),
    label: m('window'),
    submenu: [
      { role: 'minimize', label: m('minimize') },
      ...(mac ? [{ role: 'zoom' as const, label: m('zoom') }] : []),
      sep,
      { id: 'nextTab', label: m('nextTab'), accelerator: 'Ctrl+Tab', ...shown, enabled: state.documentCount > 1 },
      { id: 'previousTab', label: m('previousTab'), accelerator: 'Ctrl+Shift+Tab', ...shown, enabled: state.documentCount > 1 },
      ...(mac ? [sep, { role: 'front' as const, label: m('bringAllToFront') }] : [])
    ]
  }

  const helpMenu: PlusMenuItem = {
    ...(mac ? { role: 'help' as const } : {}),
    label: m('help'),
    submenu: [
      { id: 'guide', label: m('guide') },
      { id: 'plus:repository', label: m('repository') },
      // On the Mac these live in the app menu.
      ...(mac
        ? []
        : [sep, { id: 'checkForUpdates', label: m('checkForUpdates') }, sep, { id: 'about', label: m('about') }])
    ]
  }

  const menu: PlusMenuItem[] = mac
    ? [
        {
          label: appName,
          submenu: [
            { role: 'about', label: m('about') },
            sep,
            { id: 'settings', label: m('settings'), accelerator: 'Cmd+,', ...shown },
            { id: 'checkForUpdates', label: m('checkForUpdates') },
            sep,
            { role: 'services', label: m('services') },
            sep,
            { role: 'hide', label: m('hide') },
            { role: 'hideOthers', label: m('hideOthers') },
            { role: 'unhide', label: m('showAll') },
            sep,
            { id: 'quit', label: m('quit'), accelerator: 'Cmd+Q' }
          ]
        },
        fileMenu,
        editMenu,
        viewMenu,
        windowMenu,
        helpMenu
      ]
    : [fileMenu, editMenu, viewMenu, windowMenu, helpMenu]

  const serialized = JSON.stringify(menu)
  useEffect(() => {
    if (!mac) {
      appMenu = JSON.parse(serialized) as PlusMenuItem[]
      return
    }
    window.api.setMenu(JSON.parse(serialized) as PlusMenuItem[])
  }, [mac, serialized, i18n.language])

  useEffect(() => {
    const dispatch = (id: string): void => {
      const a = actionsRef.current
      const [command, arg] = id.split(':')
      switch (command) {
        case 'openRecent': {
          const path = recentRef.current[Number(arg)]
          if (path) a.openRecent(path)
          return
        }
        case 'export':
          return a.export(arg as ExportFormat)
        case 'mode':
          return a.setMode(arg as 'view' | 'edit')
        case 'appearance':
          return a.setAppearance(arg as ThemePreference)
        case 'quit':
          // On the Mac main answers Quit itself; the app menu button routes it here.
          return window.api.requestQuit()
        default: {
          const action = (a as unknown as Record<string, unknown>)[command]
          if (typeof action === 'function') (action as () => void)()
        }
      }
    }
    dispatchMenuCommand = dispatch
    if (!mac) return
    return window.api.onMenuCommand(dispatch)
  }, [mac])
}
