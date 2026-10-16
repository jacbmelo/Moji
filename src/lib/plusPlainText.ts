// Moji Plus: plain-text documents (.txt) are shown exactly as written, not parsed as Markdown
// (see FORK.md). Called from the Markdown worker, so preview and exports take the same path.
import type { RawMarkdownBlock, RawMarkdownRenderResult, RenderMarkdownOptions } from './markdownCore'

/** Same limits as the Markdown virtual sections in markdownCore's splitTopLevelBlocks. */
const BLOCK_MAX_LINES = 120
const BLOCK_MAX_CHARS = 32_000

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function plainTextHtml(text: string): string {
  return `<div class="plus-plain-text">${escapeHtml(text)}</div>`
}

function splitIntoBlocks(lines: string[]): string[] {
  const blocks: string[] = []
  let current: string[] = []
  let chars = 0
  for (const line of lines) {
    if (current.length > 0 && (current.length >= BLOCK_MAX_LINES || chars + line.length > BLOCK_MAX_CHARS)) {
      blocks.push(current.join('\n'))
      current = []
      chars = 0
    }
    current.push(line)
    chars += line.length + 1
  }
  if (current.length > 0) blocks.push(current.join('\n'))
  return blocks
}

export function renderPlainTextRaw(source: string, options: RenderMarkdownOptions = {}): RawMarkdownRenderResult {
  const startedAt = performance.now()
  const text = (source ?? '').replace(/^﻿/, '').replace(/\r\n?/g, '\n')
  const blocks = options.blockMode
    ? splitIntoBlocks(text.split('\n')).map((blockText, index): RawMarkdownBlock => ({
      id: `markdown-block-${index}`,
      rawHtml: plainTextHtml(blockText),
      text: blockText,
      headingIds: [],
      estimatedHeight: Math.max(48, blockText.split('\n').length * 24, Math.ceil(blockText.length / 88) * 24)
    }))
    : undefined
  const rawHtml = blocks ? '' : plainTextHtml(text)
  const renderHtmlMs = performance.now() - startedAt
  return {
    rawHtml,
    blocks,
    outline: [],
    headingLines: [],
    timings: { parseMs: 0, outlineMs: 0, renderHtmlMs, totalMs: renderHtmlMs }
  }
}
