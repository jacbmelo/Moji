import { useTranslation } from 'react-i18next'
import type { UpdateState } from '../../electron/shared'
import { APP_NAME, AUTHOR, RELEASES_URL, REPOSITORY_URL, UPSTREAM } from '../../electron/brand'
import { IconRefresh, IconX } from './icons'
import logoMark from '../assets/brand/logo-mark.png'

interface AboutDialogProps {
  version: string
  updateState: UpdateState
  onClose: () => void
  onCheckForUpdates: () => void
}

export function AboutDialog({ version, updateState, onClose, onCheckForUpdates }: AboutDialogProps): JSX.Element {
  const { t } = useTranslation()
  const checking = updateState.status === 'checking'
  const checkDisabled = ['unsupported', 'checking', 'available'].includes(updateState.status)

  const updateStatus =
    updateState.status === 'checking'
      ? t('aboutDialog.updateChecking')
      : updateState.status === 'up-to-date'
        ? t('aboutDialog.updateCurrent', { version: updateState.currentVersion })
        : updateState.status === 'available'
          ? t('aboutDialog.updateAvailable', { version: updateState.version })
          : updateState.status === 'error'
            ? t('aboutDialog.updateFailed')
            : updateState.status === 'unsupported'
              ? t('aboutDialog.updateUnsupported')
              : t('aboutDialog.updateIdle', { version: updateState.currentVersion })

  return (
    <section className="export-dialog about-dialog" aria-label={t('aboutDialog.title')}>
      <header className="export-dialog__header">
        <h2 className="export-dialog__title">{t('aboutDialog.title')}</h2>
        <button className="iconbtn" onClick={onClose} title={t('dialog.cancel')} aria-label={t('dialog.cancel')}>
          <IconX />
        </button>
      </header>

      <div className="about-dialog__body">
        <section className="about-dialog__hero">
          <div className="about-dialog__mark" aria-hidden="true">
            <img className="about-dialog__mark-img" src={logoMark} alt="" />
          </div>
          <div className="about-dialog__hero-content">
            <p className="about-dialog__eyebrow">{t('aboutDialog.application')}</p>
            <h3 className="about-dialog__name">{APP_NAME}</h3>
            <span className="about-dialog__badge">{t('aboutDialog.version', { version })}</span>
          </div>
        </section>

        <section className="settings-section" aria-labelledby="about-author-heading">
          <h3 className="settings-section__heading" id="about-author-heading">
            {t('aboutDialog.authorTitle')}
          </h3>

          <div className="about-dialog__meta">
            <div className="about-dialog__row">
              <span className="about-dialog__label">{t('aboutDialog.authorLabel')}</span>
              <span>{AUTHOR.name}</span>
            </div>
            <div className="about-dialog__row">
              <span className="about-dialog__label">{t('aboutDialog.profileLabel')}</span>
              <a className="about-dialog__link" href={AUTHOR.profileUrl} target="_blank" rel="noreferrer">
                {AUTHOR.profileUrl}
              </a>
            </div>
            <div className="about-dialog__row">
              <span className="about-dialog__label">{t('aboutDialog.repositoryLabel')}</span>
              <a className="about-dialog__link" href={REPOSITORY_URL} target="_blank" rel="noreferrer">
                {REPOSITORY_URL}
              </a>
            </div>
          </div>
        </section>

        <section className="settings-section" aria-labelledby="about-upstream-heading">
          <h3 className="settings-section__heading" id="about-upstream-heading">
            {t('aboutDialog.upstreamTitle')}
          </h3>

          <div className="about-dialog__meta">
            <div className="about-dialog__row">
              <span className="about-dialog__label">{t('aboutDialog.application')}</span>
              <span>{UPSTREAM.name} {UPSTREAM.baseVersion}</span>
            </div>
            <div className="about-dialog__row">
              <span className="about-dialog__label">{t('aboutDialog.authorTitle')}</span>
              <a className="about-dialog__link" href={UPSTREAM.profileUrl} target="_blank" rel="noreferrer">
                {UPSTREAM.author}
              </a>
            </div>
            <div className="about-dialog__row">
              <span className="about-dialog__label">{t('aboutDialog.repositoryLabel')}</span>
              <a className="about-dialog__link" href={UPSTREAM.repositoryUrl} target="_blank" rel="noreferrer">
                {UPSTREAM.repositoryUrl}
              </a>
            </div>
          </div>
          <p className="about-dialog__text">{t('aboutDialog.upstreamBody')}</p>
        </section>

        <section className="settings-section" aria-labelledby="about-name-heading">
          <h3 className="settings-section__heading" id="about-name-heading">
            {t('aboutDialog.whyNameTitle')}
          </h3>
          <p className="about-dialog__text">{t('aboutDialog.whyNameBody')}</p>
        </section>

        <div className="about-dialog__update">
          <span className="about-dialog__update-status" aria-live="polite">{updateStatus}</span>
          {updateState.status === 'available' ? (
            <a className="btn btn--primary" href={RELEASES_URL} target="_blank" rel="noreferrer">
              <IconRefresh aria-hidden="true" />
              {t('aboutDialog.openReleases')}
            </a>
          ) : (
            <button className="btn" onClick={onCheckForUpdates} disabled={checkDisabled}>
              <IconRefresh aria-hidden="true" />
              {checking ? t('aboutDialog.checkingForUpdates') : t('aboutDialog.checkForUpdates')}
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
