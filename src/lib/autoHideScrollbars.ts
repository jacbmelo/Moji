const VISIBLE_CLASS = 'scrollbar-visible'
const HIDE_DELAY_MS = 1000

const hideTimers = new WeakMap<Element, number>()

// macOS draws its own overlay scrollbars. Read on every event so DevTools can override it for testing.
function isMac(): boolean {
  return document.documentElement.dataset.platform === 'darwin'
}

function showScrollbar(element: Element): void {
  element.classList.add(VISIBLE_CLASS)
  window.clearTimeout(hideTimers.get(element))
  hideTimers.set(
    element,
    window.setTimeout(() => {
      element.classList.remove(VISIBLE_CLASS)
      hideTimers.delete(element)
    }, HIDE_DELAY_MS)
  )
}

// True when the pointer is inside the element's border box but outside its client box, which is
// where classic scrollbars are drawn (on either side, so right-to-left layouts work too).
function isOverScrollbar(element: Element, event: PointerEvent): boolean {
  const overflows = element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth
  if (!overflows) return false
  const rect = element.getBoundingClientRect()
  const left = rect.left + element.clientLeft
  const top = rect.top + element.clientTop
  const insideClient =
    event.clientX >= left &&
    event.clientX < left + element.clientWidth &&
    event.clientY >= top &&
    event.clientY < top + element.clientHeight
  return !insideClient
}

/** Hides classic scrollbars until their container scrolls or the pointer reaches them, like macOS. */
export function installAutoHideScrollbars(): void {
  // `scroll` does not bubble, but a capturing listener on document sees it for every container.
  document.addEventListener(
    'scroll',
    (event) => {
      if (isMac()) return
      const target = event.target === document ? document.scrollingElement : event.target
      if (target instanceof Element) showScrollbar(target)
    },
    { capture: true, passive: true }
  )

  document.addEventListener(
    'pointermove',
    (event) => {
      if (isMac() || !(event.target instanceof Element)) return
      if (isOverScrollbar(event.target, event)) showScrollbar(event.target)
    },
    { capture: true, passive: true }
  )
}
