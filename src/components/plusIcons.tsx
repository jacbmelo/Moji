// Moji Plus: extra icons in the style of icons.tsx, drawn after their SF Symbols counterparts.
import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const base = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const
}

/** square.and.arrow.up */
export const IconShare = (p: IconProps): JSX.Element => (
  <svg {...base} {...p}>
    <path d="M12 3v12M8 7l4-4 4 4" />
    <path d="M8.5 10H7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-1.5" />
  </svg>
)
