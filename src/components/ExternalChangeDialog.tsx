import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { IconAlertTriangle, IconRefresh, IconSave, IconX } from './icons'

/**
 * - `modified`: another application changed the file while it has unsaved edits here.
 * - `deleted`: the file was removed or moved away.
 * - `conflict`: a save found the file changed since it was read.
 */
export type ExternalChangeVariant = 'modified' | 'deleted' | 'conflict'

export type ExternalChangeChoice = 'reload' | 'save' | 'saveAs' | 'overwrite' | 'keep' | 'cancel'

interface ExternalChangeDialogProps {
  variant: ExternalChangeVariant
  name: string
  onChoice: (choice: ExternalChangeChoice) => void
}

/** Modal shown when the file behind an open document changed outside the app. */
export function ExternalChangeDialog({ variant, name, onChoice }: ExternalChangeDialogProps): JSX.Element {
  const { t } = useTranslation()
  // Dismissing never touches either version: it keeps the edits here and leaves the disk alone.
  const dismiss: ExternalChangeChoice = variant === 'conflict' ? 'cancel' : 'keep'

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      onChoice(dismiss)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [dismiss, onChoice])

  return (
    <div className="dialog-backdrop" onClick={() => onChoice(dismiss)}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="external-change-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="dialog__title" id="external-change-title">
          <IconAlertTriangle className="dialog__title-icon" aria-hidden="true" />
          <span>{t(`externalChange.${variant}Title`)}</span>
        </h2>
        <p className="dialog__body">{t(`externalChange.${variant}Body`, { name })}</p>
        <div className="dialog__actions">
          <button className="btn" onClick={() => onChoice(dismiss)}>
            <IconX aria-hidden="true" />
            {t(variant === 'conflict' ? 'externalChange.cancel' : 'externalChange.keep')}
          </button>
          {variant === 'deleted' ? (
            <button className="btn" onClick={() => onChoice('save')}>
              <IconSave aria-hidden="true" />
              {t('externalChange.save')}
            </button>
          ) : (
            <button className="btn" onClick={() => onChoice('reload')}>
              <IconRefresh aria-hidden="true" />
              {t('externalChange.reload')}
            </button>
          )}
          {variant === 'conflict' && (
            <button className="btn" onClick={() => onChoice('overwrite')}>
              <IconSave aria-hidden="true" />
              {t('externalChange.overwrite')}
            </button>
          )}
          <button className="btn btn--primary" onClick={() => onChoice('saveAs')}>
            <IconSave aria-hidden="true" />
            {t('externalChange.saveAs')}
          </button>
        </div>
      </div>
    </div>
  )
}
