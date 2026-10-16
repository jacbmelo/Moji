// Moji Plus: YAML front matter rendered as a properties panel (a list of keys and values)
// instead of a code block, in the preview and in exports alike. markdownCore.ts calls it from
// its front_matter rule; when the YAML does not parse to a map, the block stays the
// highlighted source it was. See FORK.md.
import { dump, load } from 'js-yaml'

type Escape = (value: string) => string
type HighlightYaml = (value: string) => string

function isScalar(value: unknown): boolean {
  return value === null || value instanceof Date || ['string', 'number', 'boolean', 'bigint'].includes(typeof value)
}

function formatDate(date: Date): string {
  const iso = date.toISOString()
  // YAML dates without a time come as midnight UTC.
  return iso.endsWith('T00:00:00.000Z') ? iso.slice(0, 10) : `${iso.slice(0, 16).replace('T', ' ')} UTC`
}

function renderScalar(value: unknown, escape: Escape): string {
  if (value === null || value === undefined || value === '') return '<span class="front-matter__empty">—</span>'
  if (value instanceof Date) return `<time>${escape(formatDate(value))}</time>`
  const text = String(value)
  if (typeof value === 'string' && /^(?:https?:\/\/|mailto:)\S+$/i.test(text)) {
    return `<a href="${escape(text)}">${escape(text)}</a>`
  }
  return escape(text)
}

function renderValue(value: unknown, escape: Escape, highlight: HighlightYaml): string {
  if (isScalar(value)) return renderScalar(value, escape)
  if (Array.isArray(value) && value.every(isScalar)) {
    if (value.length === 0) return renderScalar(null, escape)
    return `<span class="front-matter__tags">${value
      .map((item) => `<span class="front-matter__tag">${renderScalar(item, escape)}</span>`)
      .join('')}</span>`
  }
  // Nested maps and lists keep their YAML form, compact.
  return `<pre class="hljs front-matter__yaml"><code>${highlight(dump(value, { lineWidth: -1 }).trimEnd())}</code></pre>`
}

/** The properties panel, or null when the front matter is not a YAML map. */
export function renderFrontMatterProperties(content: string, escape: Escape, highlight: HighlightYaml): string | null {
  let data: unknown
  try {
    data = load(content)
  } catch {
    return null
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null
  const entries = Object.entries(data as Record<string, unknown>)
  if (entries.length === 0) return null

  const rows = entries
    .map(([key, value]) => `<div class="front-matter__row"><dt>${escape(key)}</dt><dd>${renderValue(value, escape, highlight)}</dd></div>`)
    .join('')
  return `<div class="front-matter front-matter--properties"><dl class="front-matter__list">${rows}</dl></div>\n`
}
