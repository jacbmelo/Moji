// Moji Plus: the Save dialog of a new document suggests a slug of its title instead of
// "Untitled.md". The title is the front matter `title:`, else the first heading, else the
// first line of text.

const MAX_SLUG_LENGTH = 60

export function slugify(value: string): string {
  const slug = value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
  if (slug.length <= MAX_SLUG_LENGTH) return slug
  const cut = slug.slice(0, MAX_SLUG_LENGTH + 1)
  const lastDash = cut.lastIndexOf('-')
  return (lastDash > 0 ? cut.slice(0, lastDash) : cut.slice(0, MAX_SLUG_LENGTH)).replace(/-+$/, '')
}

function plainText(line: string): string {
  return line
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/[*_~`]/g, '')
    .trim()
}

function frontMatterTitle(lines: string[]): { title: string | null; end: number } {
  if (lines[0]?.trim() !== '---') return { title: null, end: 0 }
  for (let i = 1; i < lines.length; i++) {
    if (/^(---|\.\.\.)\s*$/.test(lines[i])) {
      for (const line of lines.slice(1, i)) {
        const match = /^title\s*:\s*(.+)$/i.exec(line)
        if (match) return { title: match[1].trim().replace(/^(['"])(.*)\1$/, '$2'), end: i + 1 }
      }
      return { title: null, end: i + 1 }
    }
  }
  return { title: null, end: 0 }
}

export function titleFromContent(markdown: string): string | null {
  const lines = markdown.split(/\r?\n/)
  const front = frontMatterTitle(lines)
  if (front.title) return front.title

  const body = lines.slice(front.end)
  let inFence = false
  let firstLine: string | null = null
  for (let i = 0; i < body.length; i++) {
    const line = body[i]
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence
      continue
    }
    if (inFence || !line.trim()) continue

    const atx = /^\s{0,3}#{1,6}\s+(.*?)\s*#*\s*$/.exec(line)
    if (atx) return plainText(atx[1]) || null
    if (/^\s{0,3}(=+|-+)\s*$/.test(body[i + 1] ?? '') && !/^\s{0,3}[-*+>]/.test(line)) {
      return plainText(line) || null
    }
    if (firstLine === null) {
      const text = plainText(line.replace(/^\s*(?:>\s*)*(?:[-*+]\s+(?:\[[ xX]\]\s+)?|\d+[.)]\s+)?/, ''))
      if (text) firstLine = text
    }
  }
  return firstLine
}

export function suggestedSlugName(markdown: string): string | null {
  const title = titleFromContent(markdown)
  const slug = title ? slugify(title) : ''
  return slug ? `${slug}.md` : null
}
