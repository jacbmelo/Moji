// Moji Plus: arrow-key navigation in the outline sidebar, as in a native outline view.
// Up/Down move between visible headings, Right expands or enters a section, Left collapses or
// goes to the parent, Home/End jump to the ends. Works on the rendered tree, so OutlineTree
// keeps its upstream shape.
import type { KeyboardEvent } from 'react'

const LABEL = '.outline-item__label'

function rowOf(label: Element): Element | null {
  return label.closest('.outline-item')
}

function toggleOf(label: Element): HTMLButtonElement | null {
  return rowOf(label)?.querySelector<HTMLButtonElement>('button.outline-item__toggle') ?? null
}

function parentLabel(label: Element): HTMLElement | null {
  const parentNode = label.closest('.outline-tree__children')?.closest('.outline-tree__node')
  return parentNode?.querySelector<HTMLElement>(`:scope > .outline-item ${LABEL}`) ?? null
}

export function plusOutlineKeyDown(event: KeyboardEvent<HTMLElement>): void {
  const current = (event.target as Element).closest(LABEL)
  if (!current) return
  const labels = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(LABEL))
  const index = labels.indexOf(current as HTMLElement)
  const toggle = toggleOf(current)
  const expanded = toggle?.getAttribute('aria-expanded') === 'true'
  let next: HTMLElement | null = null

  switch (event.key) {
    case 'ArrowDown':
      next = labels[index + 1] ?? null
      break
    case 'ArrowUp':
      next = labels[index - 1] ?? null
      break
    case 'Home':
      next = labels[0] ?? null
      break
    case 'End':
      next = labels[labels.length - 1] ?? null
      break
    case 'ArrowRight':
      if (toggle && !expanded) toggle.click()
      else if (expanded) next = labels[index + 1] ?? null
      break
    case 'ArrowLeft':
      if (toggle && expanded) toggle.click()
      else next = parentLabel(current)
      break
    default:
      return
  }

  event.preventDefault()
  next?.focus()
}
