import { useTranslation } from 'react-i18next'
import { IconX } from './icons'
import { VIM_SHORTCUTS, platformKeyLabel, platformKeys } from '../lib/vimShortcuts'

interface VimHelpDialogProps {
  onClose: () => void
}

export function VimHelpDialog({ onClose }: VimHelpDialogProps): JSX.Element {
  const { t } = useTranslation()

  return (
    <section className="export-dialog settings-dialog" aria-label={t('settingsDialog.vimHelpTitle')} role="dialog">
      <header className="export-dialog__header">
        <h2 className="export-dialog__title">
          <span>{t('settingsDialog.vimHelpTitle')}</span>
        </h2>
        <button className="iconbtn" onClick={onClose} title={t('dialog.cancel')} aria-label={t('dialog.cancel')}>
          <IconX />
        </button>
      </header>

      <div className="settings-dialog__body">
        <section className="settings-section">
          <div className="settings-shortcut-list">
            {VIM_SHORTCUTS.map((item) => (
              <div className="settings-shortcut" key={item.action}>
                <span className="settings-shortcut__label">{t(`settingsDialog.shortcutActions.${item.action}`)}</span>
                <span className="settings-shortcut__keys">
                  {platformKeys(item.keys, item.macKeys).map((key, index) => (
                    <kbd className="settings-shortcut__key" key={`${item.action}-${index}`}>
                      {platformKeyLabel(key)}
                    </kbd>
                  ))}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}
