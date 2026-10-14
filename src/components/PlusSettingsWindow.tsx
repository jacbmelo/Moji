// Moji Plus: the Settings window (electron/plusSettingsWindow.ts). It reuses SettingsDialog; every
// change is written at once, with no Save button, and main relays it to the main window.
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SettingsDialog } from './SettingsDialog'
import { applyDocumentTheme } from '../hooks/useAppState'
import type { Settings } from '../../electron/shared'

export function PlusSettingsWindow(): JSX.Element | null {
  const { t, i18n } = useTranslation()
  const [settings, setSettings] = useState<Settings | null>(null)

  const adopt = useCallback(
    (next: Settings) => {
      setSettings(next)
      if (next.language !== i18n.language) void i18n.changeLanguage(next.language)
    },
    [i18n]
  )

  useEffect(() => {
    void window.api.getSettings().then(adopt)
    return window.api.onSettingsChanged(adopt)
  }, [adopt])

  // The resolved theme follows the OS (main sets nativeTheme.themeSource from `appearance`).
  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (): void => applyDocumentTheme()
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    document.title = t('settingsDialog.title')
  }, [t])

  // Esc and Cmd/Ctrl+W close the window, as in any settings window.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' || ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'w')) {
        event.preventDefault()
        window.close()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const change = useCallback(
    (patch: Partial<Settings>) => {
      setSettings((current) => (current ? { ...current, ...patch } : current))
      if (patch.language) void i18n.changeLanguage(patch.language)
      void window.api.setSettings(patch).then(adopt)
    },
    [adopt, i18n]
  )

  if (!settings) return null
  return (
    <div className="plus-settings-window">
      <SettingsDialog settings={settings} onChange={change} onClose={() => window.close()} />
    </div>
  )
}
