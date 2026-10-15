// Moji Plus: Settings in a window of its own (HIG "Settings"), on every platform. It runs the
// same renderer at `#settings` and may only use the settings channels (see main.ts). Changes
// apply immediately: main broadcasts every settings write to the other window. See FORK.md.
import { BrowserWindow, nativeTheme, type WebContents } from 'electron'

let settingsWindow: BrowserWindow | null = null

/** Channels the Settings window may call; everything else stays main-window only. */
export const SETTINGS_WINDOW_CHANNELS = new Set<string>()

export function settingsWebContents(): WebContents | null {
  return settingsWindow && !settingsWindow.isDestroyed() ? settingsWindow.webContents : null
}

export function openSettingsWindow(options: { preload: string; icon?: string; load: (win: BrowserWindow) => void }): void {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.show()
    settingsWindow.focus()
    return
  }
  const mac = process.platform === 'darwin'
  settingsWindow = new BrowserWindow({
    width: 680,
    height: 560,
    minWidth: 560,
    minHeight: 420,
    show: false,
    icon: options.icon,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    autoHideMenuBar: true,
    backgroundColor: mac ? '#00000000' : nativeTheme.shouldUseDarkColors ? '#202021' : '#f3f4f6',
    ...(mac ? { titleBarStyle: 'hidden' as const, trafficLightPosition: { x: 14, y: 11 }, vibrancy: 'sidebar' as const } : {}),
    webPreferences: {
      preload: options.preload,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true
    }
  })
  settingsWindow.setMenuBarVisibility(false)
  settingsWindow.once('ready-to-show', () => settingsWindow?.show())
  settingsWindow.on('closed', () => {
    settingsWindow = null
  })
  // Same origin rules as the main window: nothing navigates away or opens windows.
  settingsWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
  settingsWindow.webContents.on('will-navigate', (event) => event.preventDefault())
  options.load(settingsWindow)
}

export function closeSettingsWindow(): void {
  if (settingsWindow && !settingsWindow.isDestroyed()) settingsWindow.close()
}

/** Sends `channel` to every app window except `except`, so each one shows the same settings. */
export function sendToOtherWindows(except: WebContents | null, channel: string, ...args: unknown[]): void {
  for (const win of BrowserWindow.getAllWindows()) {
    if (!win.isDestroyed() && win.webContents !== except) win.webContents.send(channel, ...args)
  }
}
