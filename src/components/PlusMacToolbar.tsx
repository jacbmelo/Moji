// Moji Plus: unified single-row toolbar (HIG "Toolbars"), on every platform. Commands that
// live in the app menu (New, Open, Save, Settings, About) leave the toolbar: the menu bar on
// the Mac, the app menu button on Windows and Linux. The search field and its popover come
// from TopBar unchanged. See FORK.md.
import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { FontSizeButton } from './FontSizeButton'
import { IconEye, IconLayoutWidth, IconMoon, IconPencil, IconSidebar, IconSplitPreview, IconSun } from './icons'
import { IconMenu, IconShare } from './plusIcons'
import { openPlusAppMenu } from '../lib/plusMenu'
import type { TopBarProps } from './TopBar'

export function PlusMacToolbar(props: TopBarProps & { search: ReactNode }): JSX.Element {
  const { t, i18n } = useTranslation()
  const panelOpen = props.exportOpen || props.settingsOpen || props.aboutOpen
  const segmentRef = useRef<HTMLDivElement>(null)

  // The selected segment's pill is one element that slides between Preview and Editor, as the
  // macOS segmented control does; it follows the selected button's position and width.
  useLayoutEffect(() => {
    const segment = segmentRef.current
    if (!segment) return
    const place = (): void => {
      const active = segment.querySelector<HTMLElement>('.segment__btn--active')
      segment.dataset.pill = active ? 'on' : 'off'
      if (!active) return
      segment.style.setProperty('--pill-x', `${active.offsetLeft}px`)
      segment.style.setProperty('--pill-w', `${active.offsetWidth}px`)
    }
    place()
    // Animate only changes made after the first placement.
    const ready = requestAnimationFrame(() => segment.setAttribute('data-pill-ready', ''))
    const observer = new ResizeObserver(place)
    observer.observe(segment)
    return () => {
      cancelAnimationFrame(ready)
      observer.disconnect()
    }
  }, [props.mode, panelOpen, props.hasDoc, i18n.language])
  const edited = props.title.startsWith(t('app.modifiedMarker'))
  const name = edited ? props.title.slice(t('app.modifiedMarker').length).trimStart() : props.title

  return (
    <>
    {/* Rendered last in <body>: the window drag regions are resolved in document order on
        Windows and Linux, so a no-drag button placed before the sidebar and toolbar (which drag)
        would have its clicks taken by the window. */}
    {window.api.platform !== 'darwin' && createPortal(
      <button
        className="iconbtn plus-app-menu-button"
        type="button"
        onClick={(event) => openPlusAppMenu(event.currentTarget)}
        title={t('plus.menu.appMenu')}
        aria-label={t('plus.menu.appMenu')}
        aria-haspopup="menu"
      >
        <IconMenu />
      </button>,
      document.body
    )}
    <header className="topbar plus-toolbar">
      <div className="plus-toolbar__leading">
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
      </div>

      <div className="segment" ref={segmentRef} role="radiogroup" aria-label={t('toolbar.viewMode')}>
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

      <div className="plus-toolbar__trailing">
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

        <button
          className={`iconbtn ${props.previewFluidWidth ? 'iconbtn--active' : ''}`}
          type="button"
          onClick={props.onTogglePreviewWidth}
          disabled={!props.canTogglePreviewWidth}
          title={props.previewFluidWidth ? t('toolbar.useFixedWidth') : t('toolbar.useFluidWidth')}
          aria-label={props.previewFluidWidth ? t('toolbar.useFixedWidth') : t('toolbar.useFluidWidth')}
          aria-pressed={props.previewFluidWidth}
        >
          <IconLayoutWidth />
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
          className="iconbtn"
          type="button"
          onClick={props.onToggleTheme}
          title={props.theme === 'dark' ? t('toolbar.themeLight') : t('toolbar.themeDark')}
          aria-label={props.theme === 'dark' ? t('toolbar.themeLight') : t('toolbar.themeDark')}
        >
          {props.theme === 'dark' ? <IconSun /> : <IconMoon />}
        </button>

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
      </div>
    </header>
    </>
  )
}
