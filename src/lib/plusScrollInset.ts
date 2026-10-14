// Moji Plus: on macOS the document scrolls under the translucent toolbar (plus-hig.css), so each
// scroller reserves the toolbar's height as `scroll-padding-top`. Geometry that means "the top of
// the visible document" reads this inset; elsewhere it is 0 and nothing changes. See FORK.md.
export function plusScrollInset(scroller: Element): number {
  const inset = parseFloat(getComputedStyle(scroller).scrollPaddingTop)
  return Number.isFinite(inset) ? inset : 0
}
