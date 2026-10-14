// Moji Plus: describes the macOS menu bar (electron/plusMenu.ts builds it). Shortcuts that the
// app's own keydown handler already answers are only displayed (`registerAccelerator: false`),
// so key handling stays exactly as it is; the rest are native roles or menu-owned commands.
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { APP_NAME } from '../../electron/brand'
import type { PlusMenuItem } from '../../electron/plusMenu'
import type { ExportFormat, ThemePreference } from '../../electron/shared'
import { useContextMenuLabels } from './plusContextMenu'

export interface PlusMenuState {
  hasDoc: boolean
  readOnly: boolean
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
}

const shown = { registerAccelerator: false } as const
const sep = { type: 'separator' } as const

function fileName(path: string): string {
  return path.split(/[\\/]/).pop() || path
}

export function usePlusMenu(state: PlusMenuState, actions: PlusMenuActions): void {
  const appName = APP_NAME
  const { t, i18n } = useTranslation()
  useContextMenuLabels()
  const actionsRef = useRef(actions)
  actionsRef.current = actions
  const recentRef = useRef(state.recentFiles)
  recentRef.current = state.recentFiles
  const fullscreen = document.documentElement.hasAttribute('data-fullscreen')

  const m = (key: string): string => t(`plus.menu.${key}`, { name: appName })
  const doc = state.hasDoc
  const menu: PlusMenuItem[] = [
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
    {
      label: m('file'),
      submenu: [
        { id: 'newDocument', label: m('new'), accelerator: 'Cmd+N', ...shown },
        { id: 'open', label: m('open'), accelerator: 'Cmd+O', ...shown },
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
        { id: 'close', label: m('close'), accelerator: 'Cmd+W', ...shown, enabled: doc },
        { id: 'save', label: m('save'), accelerator: 'Cmd+S', ...shown, enabled: doc && !state.readOnly },
        { id: 'saveAs', label: m('saveAs'), accelerator: 'Shift+Cmd+S', ...shown, enabled: doc },
        sep,
        {
          label: m('export'),
          enabled: doc,
          submenu: [
            { id: 'export:pdf', label: m('exportPdf'), accelerator: 'Shift+Cmd+E', ...shown },
            { id: 'export:html', label: m('exportHtml') },
            { id: 'export:png', label: m('exportPng') }
          ]
        }
      ]
    },
    {
      label: m('edit'),
      submenu: [
        { role: 'undo', label: m('undo') },
        { role: 'redo', label: m('redo') },
        sep,
        { role: 'cut', label: m('cut') },
        { role: 'copy', label: m('copy') },
        { role: 'paste', label: m('paste') },
        { role: 'pasteAndMatchStyle', label: m('pasteAndMatchStyle') },
        { role: 'delete', label: m('delete') },
        // The app scopes Select All to the document instead of the whole window.
        { id: 'selectAll', label: m('selectAll'), accelerator: 'Cmd+A' },
        sep,
        {
          label: m('find'),
          submenu: [
            { id: 'find', label: m('findEllipsis'), accelerator: 'Cmd+F', ...shown, enabled: doc },
            // Cmd+H belongs to Hide on the Mac, so Replace takes the standard Option-Cmd-F.
            { id: 'replace', label: m('findAndReplace'), accelerator: 'Alt+Cmd+F', enabled: state.canReplace },
            { id: 'findNext', label: m('findNext'), accelerator: 'Cmd+G', ...shown, enabled: doc },
            { id: 'findPrevious', label: m('findPrevious'), accelerator: 'Shift+Cmd+G', ...shown, enabled: doc }
          ]
        },
        sep,
        {
          label: m('speech'),
          submenu: [
            { role: 'startSpeaking', label: m('startSpeaking') },
            { role: 'stopSpeaking', label: m('stopSpeaking') }
          ]
        }
      ]
    },
    {
      label: m('view'),
      submenu: [
        { id: 'mode:view', type: 'radio', label: m('preview'), checked: doc && state.mode === 'view', enabled: doc },
        { id: 'mode:edit', type: 'radio', label: m('editor'), checked: doc && state.mode === 'edit', enabled: doc },
        { id: 'toggleMode', label: m('toggleMode'), accelerator: 'Cmd+E', ...shown, enabled: doc },
        { id: 'toggleSplit', type: 'checkbox', label: m('livePreview'), accelerator: 'Cmd+\\', ...shown, checked: state.splitView, enabled: state.canToggleSplit },
        sep,
        {
          id: 'toggleOutline',
          label: state.outlineVisible ? m('hideSidebar') : m('showSidebar'),
          accelerator: 'Ctrl+Cmd+S',
          enabled: state.canToggleOutline
        },
        { id: 'toggleFluidWidth', type: 'checkbox', label: m('fullWidth'), checked: state.fluidWidth, enabled: state.canToggleFluidWidth },
        sep,
        { id: 'fontReset', label: m('actualSize'), accelerator: 'Cmd+0', ...shown, enabled: state.canAdjustFontSize },
        { id: 'fontIn', label: m('zoomIn'), accelerator: 'Cmd+Plus', ...shown, enabled: state.canAdjustFontSize },
        { id: 'fontOut', label: m('zoomOut'), accelerator: 'Cmd+-', ...shown, enabled: state.canAdjustFontSize },
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
    },
    {
      role: 'window',
      label: m('window'),
      submenu: [
        { role: 'minimize', label: m('minimize') },
        { role: 'zoom', label: m('zoom') },
        sep,
        { id: 'nextTab', label: m('nextTab'), accelerator: 'Ctrl+Tab', ...shown, enabled: state.documentCount > 1 },
        { id: 'previousTab', label: m('previousTab'), accelerator: 'Ctrl+Shift+Tab', ...shown, enabled: state.documentCount > 1 },
        sep,
        { role: 'front', label: m('bringAllToFront') }
      ]
    },
    {
      role: 'help',
      label: m('help'),
      submenu: [
        { id: 'guide', label: m('guide') },
        { id: 'plus:repository', label: m('repository') }
      ]
    }
  ]

  const serialized = JSON.stringify(menu)
  useEffect(() => {
    if (window.api.platform !== 'darwin') return
    window.api.setMenu(JSON.parse(serialized) as PlusMenuItem[])
  }, [serialized, i18n.language])

  useEffect(() => {
    if (window.api.platform !== 'darwin') return
    return window.api.onMenuCommand((id) => {
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
        default: {
          const action = (a as unknown as Record<string, unknown>)[command]
          if (typeof action === 'function') (action as () => void)()
        }
      }
    })
  }, [])
}
