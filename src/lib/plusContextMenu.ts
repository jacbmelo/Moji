// Moji Plus: renderer side of the native context menus (electron/plusContextMenu.ts).
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import type { DocumentTabItem } from '../components/DocumentTabs'

/** Hands main the translated labels of the editor and preview context menu. */
export function useContextMenuLabels(): void {
  const { t, i18n } = useTranslation()
  useEffect(() => {
    window.api.setContextMenuLabels({
      cut: t('plus.menu.cut'),
      copy: t('plus.menu.copy'),
      paste: t('plus.menu.paste'),
      selectAll: t('plus.menu.selectAll'),
      copyLink: t('plus.context.copyLink'),
      openLink: t('plus.context.openLink'),
      copyImage: t('plus.context.copyImage'),
      // `{{text}}` is filled in by main with the selection.
      lookUp: t('plus.context.lookUp', { text: '{{text}}', interpolation: { escapeValue: false } }),
      noGuesses: t('plus.context.noGuesses')
    })
  }, [t, i18n.language])
}

interface TabMenuActions {
  onClose: (id: string) => void
  onCloseOthers: (id: string) => void
  onCloseToRight: (id: string) => void
  onCloseSaved: () => void
  onCloseAll: () => void
}

/** The document tab menu, with the same entries and rules as the upstream HTML menu. */
export async function showTabContextMenu(t: TFunction, tabs: DocumentTabItem[], id: string, actions: TabMenuActions): Promise<void> {
  const index = tabs.findIndex((tab) => tab.id === id)
  const choice = await window.api.showContextMenu([
    { id: 'tab:close', label: t('tabs.closeThis') },
    { id: 'tab:others', label: t('tabs.closeOthers'), enabled: tabs.length > 1 },
    { id: 'tab:right', label: t('tabs.closeRight'), enabled: index >= 0 && index < tabs.length - 1 },
    { type: 'separator' },
    { id: 'tab:saved', label: t('tabs.closeSaved'), enabled: tabs.some((tab) => !tab.dirty) },
    { id: 'tab:all', label: t('tabs.closeAll') }
  ])
  if (choice === 'tab:close') actions.onClose(id)
  else if (choice === 'tab:others') actions.onCloseOthers(id)
  else if (choice === 'tab:right') actions.onCloseToRight(id)
  else if (choice === 'tab:saved') actions.onCloseSaved()
  else if (choice === 'tab:all') actions.onCloseAll()
}
