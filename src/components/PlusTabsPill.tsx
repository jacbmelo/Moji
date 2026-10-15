// Moji Plus: the active tab's capsule slides to the tab you select, like the Preview/Editor
// switch (PlusMacToolbar.tsx). DocumentTabs stays upstream's; this host only watches its own
// tabs and places the capsule (a pseudo-element of .document-tabs, see plus-hig.css).
import { useLayoutEffect, useRef, type ReactNode } from 'react'

export function PlusTabsPill({ children }: { children: ReactNode }): JSX.Element {
  const hostRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const host = hostRef.current
    if (!host) return
    let bar: HTMLElement | null = null
    let ready = 0
    const resize = new ResizeObserver(() => place())
    const place = (): void => {
      const next = host.querySelector<HTMLElement>('.document-tabs')
      if (next !== bar) {
        if (bar) resize.unobserve(bar)
        bar = next
        if (bar) resize.observe(bar)
      }
      if (!bar) return
      const active = bar.querySelector<HTMLElement>('.document-tab--active')
      bar.dataset.pill = active ? 'on' : 'off'
      if (!active) return
      bar.style.setProperty('--pill-x', `${active.offsetLeft}px`)
      bar.style.setProperty('--pill-w', `${active.offsetWidth}px`)
      // Animate only moves made after the first placement.
      if (!bar.hasAttribute('data-pill-ready') && !ready) {
        const target = bar
        ready = requestAnimationFrame(() => {
          target.setAttribute('data-pill-ready', '')
          ready = 0
        })
      }
    }
    place()
    // Only the tab strip is observed: tabs added, removed or selected.
    const mutations = new MutationObserver(place)
    mutations.observe(host, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] })
    return () => {
      cancelAnimationFrame(ready)
      mutations.disconnect()
      resize.disconnect()
    }
  }, [])

  return (
    <div className="plus-tabs-host" ref={hostRef}>
      {children}
    </div>
  )
}
