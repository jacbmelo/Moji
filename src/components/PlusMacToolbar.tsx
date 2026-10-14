// Moji Plus: unified single-row toolbar for macOS (HIG "Toolbars"). Commands that live in the
// menu bar on the Mac (New, Open, Save, appearance, Settings, About) leave the toolbar; the
// search field and its popover come from TopBar unchanged. See FORK.md.
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { FontSizeButton } from './FontSizeButton'
import { IconEye, IconPencil, IconSidebar, IconSplitPreview } from './icons'
import { IconShare } from './plusIcons'
import type { TopBarProps } from './TopBar'

export function PlusMacToolbar(props: TopBarProps & { search: ReactNode }): JSX.Element {
  const { t } = useTranslation()
  const panelOpen = props.exportOpen || props.settingsOpen || props.aboutOpen
  const edited = props.title.startsWith(t('app.modifiedMarker'))
  const name = edited ? props.title.slice(t('app.modifiedMarker').length).trimStart() : props.title

  return (
    <header className="topbar plus-toolbar">
      <button
        className={`iconbtn ${props.outlineVisible && props.canToggleOutline ? 'iconbtn--active' : ''}`}
        type="button"
        onClick={props.onToggleOutline}
        disabled={!props.canToggleOutline}
        title={props.outlineVisible ? t('toolbar.hideOutline') : t('toolbar.showOutline')}
        aria-label={props.outlineVisible ? t('toolbar.hideOutline') : t('toolbar.showOutline')}
        aria-pressed={props.outlineVisible}
      >
        <IconSidebar />
      </button>

      <div className="plus-toolbar__title">
        {name && <span className="plus-toolbar__name">{name}</span>}
        {edited && <span className="plus-toolbar__subtitle">{t('plus.edited')}</span>}
      </div>

      <div className="segment" role="radiogroup" aria-label={t('toolbar.viewMode')}>
        {(['view', 'edit'] as const).map((mode) => {
          const selected = !panelOpen && props.mode === mode
          return (
            <button
              key={mode}
              className={`segment__btn ${selected ? 'segment__btn--active' : ''}`}
              type="button"
              onClick={() => props.onSetMode(mode)}
              disabled={!props.hasDoc}
              role="radio"
              aria-checked={selected}
            >
              {mode === 'view' ? <IconEye width={15} height={15} /> : <IconPencil width={15} height={15} />}
              {mode === 'view' ? t('toolbar.preview') : t('toolbar.editor')}
            </button>
          )
        })}
      </div>

      <div className="plus-toolbar__items">
        <button
          className={`iconbtn ${props.splitView && props.canToggleSplit ? 'iconbtn--active' : ''}`}
          type="button"
          onClick={props.onToggleSplit}
          disabled={!props.canToggleSplit}
          title={
            !props.splitFits
              ? t('toolbar.livePreviewTooNarrow')
              : props.splitView
                ? t('toolbar.hideLivePreview')
                : t('toolbar.showLivePreview')
          }
          aria-label={props.splitView ? t('toolbar.hideLivePreview') : t('toolbar.showLivePreview')}
          aria-pressed={props.splitView}
        >
          <IconSplitPreview />
        </button>

        <FontSizeButton
          value={props.fontSize}
          min={props.minFontSize}
          max={props.maxFontSize}
          defaultValue={props.defaultFontSize}
          disabled={!props.canAdjustFontSize}
          onChange={props.onFontSizeChange}
        />

        <button
          className={`iconbtn ${props.exportOpen ? 'iconbtn--active' : ''}`}
          type="button"
          onClick={() => props.onExport('pdf')}
          disabled={!props.hasDoc}
          title={t('toolbar.export')}
          aria-label={t('toolbar.export')}
          aria-pressed={props.exportOpen}
        >
          <IconShare />
        </button>
      </div>

      {props.search}
    </header>
  )
}
