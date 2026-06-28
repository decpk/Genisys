// ─── AI Response Parser ──────────────────────────────────────────
// Parses structured delimiters from AI book generation responses.

export interface ParsedBookMeta {
  bookTitle: string
  bookId: string
}

export interface ParsedTocEntry {
  chapterNumber: number
  title: string
}

export interface ParsedChapter {
  chapterNumber: number
  title: string
  status: string
  content: string
}

export interface ParsedBookResponse {
  meta: ParsedBookMeta | null
  toc: ParsedTocEntry[] | null
  chapters: ParsedChapter[]
}

/**
 * Parse a structured book response from the AI.
 * Reads the `<lib-book>`, `<lib-toc>`, and `<lib-chapter>` block protocol.
 */
export function parseBookResponse(response: string): ParsedBookResponse {
  // Book metadata: <lib-book id="…" title="…" type="…" />
  let meta: ParsedBookMeta | null = null
  const metaMatch = response.match(/<lib-book\b([^>]*?)\/?>/i)
  if (metaMatch) {
    meta = {
      bookTitle: getTagAttr(metaMatch[1], 'title') ?? '',
      bookId: getTagAttr(metaMatch[1], 'id') ?? '',
    }
  }

  // Table of contents: <lib-toc><lib-toc-item number="1" title="…" />…</lib-toc>
  let toc: ParsedTocEntry[] | null = null
  const tocMatch = response.match(/<lib-toc\b[^>]*>([\s\S]*?)<\/lib-toc>/i)
  if (tocMatch) {
    const items: ParsedTocEntry[] = []
    const itemRe = /<lib-toc-item\b([^>]*?)\/?>/gi
    let im: RegExpExecArray | null
    while ((im = itemRe.exec(tocMatch[1])) !== null) {
      const number = parseInt(getTagAttr(im[1], 'number') ?? '', 10)
      const title = getTagAttr(im[1], 'title') ?? ''
      if (!Number.isNaN(number) && title) items.push({ chapterNumber: number, title })
    }
    toc = items
  }

  // Chapters: <lib-chapter number="N" title="…" status="completed">…</lib-chapter>
  const chapters: ParsedChapter[] = []
  const chapterRe = /<lib-chapter\b([^>]*)>([\s\S]*?)<\/lib-chapter>/gi
  let cm: RegExpExecArray | null
  while ((cm = chapterRe.exec(response)) !== null) {
    const attrs = cm[1]
    const number = parseInt(getTagAttr(attrs, 'number') ?? '', 10)
    chapters.push({
      chapterNumber: Number.isNaN(number) ? 0 : number,
      title: getTagAttr(attrs, 'title') ?? 'Untitled',
      status: getTagAttr(attrs, 'status') ?? 'completed',
      content: cm[2].trim(),
    })
  }

  return { meta, toc, chapters }
}

/** Read a double-quoted attribute value from a raw tag attribute string. */
function getTagAttr(attrStr: string, name: string): string | undefined {
  const match = attrStr.match(new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`, 'i'))
  return match ? match[1] : undefined
}

/**
 * Fallback parser for responses that don't use structured delimiters.
 * Extracts chapter titles from a simple numbered list format:
 *   Chapter 1: Title
 *   Chapter 2: Title
 */
export function parseTocFromPlainText(text: string): ParsedTocEntry[] {
  const lines = text.split('\n')
  const entries: ParsedTocEntry[] = []

  for (const line of lines) {
    const match = line.match(/^\s*(?:Chapter\s+)?(\d+)[.:]\s*(.+)$/i)
    if (match) {
      entries.push({
        chapterNumber: parseInt(match[1]),
        title: match[2].trim(),
      })
    }
  }

  return entries
}

/**
 * Check if a streaming response buffer contains a complete TOC.
 */
export function hasCompleteToc(buffer: string): boolean {
  return buffer.includes('</lib-toc>')
}

/**
 * Check if a streaming response buffer contains a complete chapter.
 */
export function hasCompleteChapter(buffer: string): boolean {
  return buffer.includes('</lib-chapter>')
}
