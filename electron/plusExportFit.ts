// Moji Plus: fits wide tables on the exported page (see FORK.md). A PDF or PNG cannot scroll,
// so a table wider than the page would be cut off; instead it is scaled down to fit.
import type { BrowserWindow } from 'electron'
import type { ExportPageOrientation } from './shared'

/** Mirrors `@page { margin: 16mm }` in src/lib/exportHtml.ts, in CSS pixels. */
const PRINT_MARGIN_PX = (16 / 25.4) * 96

/**
 * Prepares the export window's layout before the PDF is printed or the PNG captured.
 *
 * In landscape the text takes the full width of the sheet (`plus-export-landscape`, in
 * plus-markdown.css). Then every table wider than the column it sits in gets a CSS `zoom` that
 * brings it back to that width. For a PDF the page is laid out in print media, without the
 * window, so `contentWidth` is the printable width: the root is held at it while measuring,
 * which gives the same column width print will use.
 */
export async function fitExportLayout(
  win: BrowserWindow,
  pageOrientation: ExportPageOrientation,
  contentWidth?: number
): Promise<void> {
  const landscape = pageOrientation === 'landscape'
  await win.webContents.executeJavaScript(`(() => {
    const root = document.documentElement
    root.classList.toggle('plus-export-landscape', ${landscape})
    ${contentWidth ? `root.style.width = '${contentWidth}px'` : ''}
    for (const table of document.querySelectorAll('.markdown-body table')) {
      const column = table.parentElement
      const style = getComputedStyle(column)
      const available = column.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
      const width = table.getBoundingClientRect().width
      if (available > 0 && width > available + 0.5) table.style.zoom = String(available / width)
    }
    root.style.width = ''
  })()`)
}

/** Width of the printable area of a page, the column a PDF lays its content out in. */
export function printableWidth(pageWidth: number): number {
  return Math.floor(pageWidth - 2 * PRINT_MARGIN_PX)
}
