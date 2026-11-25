export interface VimShortcutItem {
  action: string
  keys: readonly string[]
  macKeys?: readonly string[]
}

export const VIM_SHORTCUTS: readonly VimShortcutItem[] = [
  { action: 'vimScrollDown', keys: ['j'] },
  { action: 'vimScrollUp', keys: ['k'] },
  { action: 'vimTop', keys: ['g', 'g'] },
  { action: 'vimBottom', keys: ['G'] },
  { action: 'vimHalfDown', keys: ['Ctrl', 'D'], macKeys: ['Control', 'D'] },
  { action: 'vimHalfUp', keys: ['Ctrl', 'U'], macKeys: ['Control', 'U'] },
  { action: 'vimNextTab', keys: ['g', 't'] },
  { action: 'vimPrevTab', keys: ['g', 'T'] },
  { action: 'vimFocusSidebar', keys: ['Ctrl', 'H'], macKeys: ['Control', 'H'] },
  { action: 'vimFocusPreview', keys: ['Ctrl', 'L'], macKeys: ['Control', 'L'] },
  { action: 'vimOutlineCollapse', keys: ['h'] },
  { action: 'vimOutlineExpand', keys: ['l'] },
  { action: 'vimSearch', keys: ['/'] },
  { action: 'vimHelp', keys: ['?'] },
  { action: 'vimSearchNext', keys: ['Ctrl', 'J'], macKeys: ['Control', 'J'] },
  { action: 'vimSearchPrev', keys: ['Ctrl', 'K'], macKeys: ['Control', 'K'] }
] as const

const isMac = typeof navigator !== 'undefined' && /Mac/i.test(navigator.userAgent)
const MAC_KEY_SYMBOLS: Record<string, string> = { Ctrl: '⌘', Control: '⌃', Shift: '⇧', Alt: '⌥', Tab: '⇥', Esc: 'esc' }
const MAC_MODIFIER_ORDER = ['Control', 'Alt', 'Shift', 'Ctrl']

export function platformKeyLabel(key: string): string {
  return isMac ? (MAC_KEY_SYMBOLS[key] ?? key) : key
}

export function platformKeys(keys: readonly string[], macKeys?: readonly string[]): readonly string[] {
  if (!isMac) return keys
  const rank = (k: string): number => {
    const index = MAC_MODIFIER_ORDER.indexOf(k)
    return index < 0 ? MAC_MODIFIER_ORDER.length : index
  }
  return [...(macKeys ?? keys)].sort((a, b) => rank(a) - rank(b))
}
