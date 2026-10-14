// Moji Plus: system appearance the renderer cannot read by itself (see FORK.md).
import { systemPreferences } from 'electron'

/** The user's accent color as `#rrggbb`, or null where the OS has none to offer (Linux). */
export function systemAccentColor(): string | null {
  if (process.platform !== 'darwin' && process.platform !== 'win32') return null
  try {
    const rgba = systemPreferences.getAccentColor()
    return /^[0-9a-f]{6}/i.test(rgba) ? `#${rgba.slice(0, 6).toLowerCase()}` : null
  } catch {
    return null
  }
}

/** Calls `onChange` with the new accent whenever the user picks another one in the OS settings. */
export function watchSystemAccentColor(onChange: (color: string | null) => void): void {
  const notify = (): void => onChange(systemAccentColor())
  if (process.platform === 'darwin') {
    systemPreferences.subscribeNotification('AppleColorPreferencesChangedNotification', notify)
  } else if (process.platform === 'win32') {
    systemPreferences.on('accent-color-changed', notify)
  }
}
