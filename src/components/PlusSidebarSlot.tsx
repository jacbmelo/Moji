// Moji Plus: shows and hides the sidebar with the slide macOS apps use (Finder, Mail). App.tsx
// unmounts the sidebar as soon as it is hidden; this slot keeps it mounted while its column
// closes, and opens the column from zero when it comes back. See plus-hig.css and FORK.md.
import { useEffect, useState, type ReactNode } from 'react'

/** Matches the transition of .plus-sidebar-slot in plus-hig.css. */
const DURATION_MS = 260

type Phase = 'closed' | 'opening' | 'open' | 'closing'

export function PlusSidebarSlot({ show, children }: { show: boolean; children: ReactNode }): JSX.Element | null {
  // Already visible at launch: no animation.
  const [phase, setPhase] = useState<Phase>(show ? 'open' : 'closed')

  useEffect(() => {
    if (show) {
      if (phase === 'open' || phase === 'opening') return
      // Mount at zero width, then open on the next frame so the width transitions.
      setPhase('opening')
      let second = 0
      const first = requestAnimationFrame(() => {
        second = requestAnimationFrame(() => setPhase('open'))
      })
      return () => {
        cancelAnimationFrame(first)
        cancelAnimationFrame(second)
      }
    }
    if (phase === 'closed') return
    setPhase('closing')
    const timer = window.setTimeout(() => setPhase('closed'), DURATION_MS)
    return () => window.clearTimeout(timer)
    // Only a change of `show` starts a transition; `phase` is read, not tracked.
  }, [show])

  if (phase === 'closed') return null
  return <div className={`plus-sidebar-slot ${phase === 'open' ? 'plus-sidebar-slot--open' : ''}`}>{children}</div>
}
