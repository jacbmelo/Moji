import { useTranslation } from 'react-i18next'
import { IconX } from './icons'

interface VimHelpDialogProps {
  onClose: () => void
}

const VIM_SHORTCUTS = [
  { action: 'vimScrollDown', keys: ['j'] },
  { action: 'vimScrollUp', keys: ['k'] },
  { action: 'vimTop', keys: ['g', 'g'] },
  { action: 'vimBottom', keys: ['G'] },
  { action: 'vimHalfDown', keys: ['Ctrl', 'D'] },
  { action: 'vimHalfUp', keys: ['Ctrl', 'U'] },
  { action: 'vimNextTab', keys: ['g', 't'] },
  { action: 'vimPrevTab', keys: ['g', 'T'] },
  { action: 'vimFocusSidebar', keys: ['Ctrl', 'H'] },
  { action: 'vimFocusPreview', keys: ['Ctrl', 'L'] },
  { action: 'vimOutlineCollapse', keys: ['h'] },
  { action: 'vimOutlineExpand', keys: ['l'] },
  { action: 'vimSearch', keys: ['/'] },
  { action: 'vimHelp', keys: ['?'] },
  { action: 'vimSearchNext', keys: ['Ctrl', 'J'] },
  { action: 'vimSearchPrev', keys: ['Ctrl', 'K'] }
] as const

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
                  {item.keys.map((key, index) => (
                    <kbd className="settings-shortcut__key" key={`${item.action}-${index}`}>
                      {key}
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
