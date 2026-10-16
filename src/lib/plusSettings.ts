// Moji Plus: keeps a window's settings in step with changes made in another window (the
// Settings window writes, the main window follows, and the other way round). See FORK.md.
import { useEffect, type Dispatch, type SetStateAction } from 'react'
import i18n from 'i18next'
import type { Settings } from '../../electron/shared'

export function usePlusSettingsSync(setSettings: Dispatch<SetStateAction<Settings>>): void {
  useEffect(
    () =>
      window.api.onSettingsChanged((next) => {
        setSettings(next)
        if (next.language !== i18n.language) void i18n.changeLanguage(next.language)
      }),
    [setSettings]
  )
}

/** Mirrors "Always show the tab bar" on the root element, for plus-hig.css. */
export function usePlusAlwaysShowTabs(on: boolean): void {
  useEffect(() => {
    document.documentElement.toggleAttribute('data-always-tabs', on)
  }, [on])
}
