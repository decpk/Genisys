// ─── Raw Markdown → Book Chapters Parser ─────────────────────────
// Splits a raw markdown document into chapters by top-level headings.

export interface RawChapter {
  title: string
  content: string
  chapterNumber: number
}

/**
 * Custom separator element authors place in the New Book Dialog's Raw Markdown
 * editor to delimit chapters. A line containing exactly this element (trimmed)
 * starts a new chapter. Markdown `#` headings are intentionally NOT treated as
 * chapter breaks in that flow so that real headings inside content stay headings.
 */
export const CHAPTER_MARKER = '<lib-chapter-break />'

/** Matches the chapter-break separator element on its own line (any self-close style). */
const CHAPTER_BREAK_RE = /^<lib-chapter-break\s*\/?>$/i

/**
 * Parse markdown into chapters using the explicit `<lib-chapter-break />` element.
 *
 * Rules:
 * - A line whose trimmed value is a `<lib-chapter-break />` element starts a new chapter.
 * - Markers inside fenced code blocks (```) are ignored.
 * - The chapter title is taken from the first non-blank line after the marker.
 *   If that line starts with `#`s, the leading `#`s and whitespace are stripped.
 *   The title line is removed from the chapter body. Falls back to `Chapter N`.
 * - Any content before the first marker is prepended to the first chapter.
 * - If no marker is found, the entire content becomes a single chapter whose
 *   title is taken from the first heading (if any) or defaults to `Chapter 1`.
 */
export function parseMarkdownByChapterMarker(markdown: string): RawChapter[] {
  const trimmed = markdown.trim()
  if (!trimmed) return []

  const lines = trimmed.split('\n')
  const segments: string[][] = []
  const preambleLines: string[] = []
  let currentLines: string[] | null = null
  let inCodeFence = false

  for (const line of lines) {
    if (line.trimStart().startsWith('```')) {
      inCodeFence = !inCodeFence
    }

    if (!inCodeFence && CHAPTER_BREAK_RE.test(line.trim())) {
      if (currentLines !== null) {
        segments.push(currentLines)
      }
      currentLines = []
      continue
    }

    if (currentLines === null) {
      preambleLines.push(line)
    } else {
      currentLines.push(line)
    }
  }

  if (currentLines !== null) {
    segments.push(currentLines)
  }

  // No marker found → single chapter from full content.
  if (segments.length === 0) {
    const fallbackTitle = extractFirstHeadingTitle(preambleLines) ?? 'Chapter 1'
    return [{ title: fallbackTitle, content: preambleLines.join('\n').trim(), chapterNumber: 1 }]
  }

  const chapters: RawChapter[] = segments.map((segLines, idx) => {
    const { title, bodyLines } = extractTitleFromSegment(segLines, idx + 1)
    return {
      title,
      content: bodyLines.join('\n').trim(),
      chapterNumber: idx + 1,
    }
  })

  // Prepend preamble (content before the first marker) to chapter 1.
  if (chapters.length > 0) {
    const preamble = preambleLines.join('\n').trim()
    if (preamble) {
      chapters[0].content = chapters[0].content
        ? preamble + '\n\n' + chapters[0].content
        : preamble
    }
  }

  return chapters
}

function extractTitleFromSegment(
  segLines: string[],
  chapterNumber: number,
): { title: string; bodyLines: string[] } {
  let titleIdx = -1
  for (let i = 0; i < segLines.length; i++) {
    if (segLines[i].trim() !== '') {
      titleIdx = i
      break
    }
  }

  if (titleIdx === -1) {
    return { title: `Chapter ${chapterNumber}`, bodyLines: segLines }
  }

  const rawTitle = segLines[titleIdx]
  const stripped = stripHeadingHashes(rawTitle).trim()
  const title = stripped.length > 0 ? stripped.slice(0, 200) : `Chapter ${chapterNumber}`
  const bodyLines = [...segLines.slice(0, titleIdx), ...segLines.slice(titleIdx + 1)]
  return { title, bodyLines }
}

function stripHeadingHashes(line: string): string {
  const match = line.match(/^\s*#{1,6}\s+(.*)$/)
  return match ? match[1] : line
}

function extractFirstHeadingTitle(lines: string[]): string | null {
  for (const line of lines) {
    const match = line.match(/^\s*#{1,6}\s+(.+?)\s*$/)
    if (match) return match[1].slice(0, 200)
  }
  return null
}

/**
 * Parse raw markdown into chapters.
 *
 * Strategy:
 * 1. Split by `# ` headings (H1). Each H1 becomes a chapter.
 * 2. If no H1 headings found, split by `## ` headings (H2).
 * 3. If no headings found at all, treat the entire content as a single chapter.
 *
 * Any content before the first heading is prepended to the first chapter.
 */
export function parseMarkdownToChapters(markdown: string): RawChapter[] {
  const trimmed = markdown.trim()
  if (!trimmed) return []

  // Try splitting by H1 first
  let chapters = splitByHeadingLevel(trimmed, 1)
  if (chapters.length > 0) return chapters

  // Fallback to H2
  chapters = splitByHeadingLevel(trimmed, 2)
  if (chapters.length > 0) return chapters

  // No headings — single chapter
  return [{ title: 'Chapter 1', content: trimmed, chapterNumber: 1 }]
}

function splitByHeadingLevel(markdown: string, level: number): RawChapter[] {
  const prefix = '#'.repeat(level) + ' '
  const lines = markdown.split('\n')
  const chapters: RawChapter[] = []
  let currentTitle: string | null = null
  let currentLines: string[] = []
  let preambleLines: string[] = []
  let inCodeFence = false

  for (const line of lines) {
    // Track fenced code blocks so we don't treat comments (e.g. `# ...`) as headings
    if (line.trimStart().startsWith('```')) {
      inCodeFence = !inCodeFence
    }

    if (!inCodeFence && line.startsWith(prefix) && !line.startsWith(prefix + '#')) {
      if (currentTitle !== null) {
        chapters.push({
          title: currentTitle,
          content: currentLines.join('\n').trim(),
          chapterNumber: chapters.length + 1,
        })
      } else if (currentLines.length > 0) {
        // Content before first heading
        preambleLines = currentLines
      }
      currentTitle = line.slice(prefix.length).trim()
      currentLines = []
    } else {
      currentLines.push(line)
    }
  }

  // Push last chapter
  if (currentTitle !== null) {
    chapters.push({
      title: currentTitle,
      content: currentLines.join('\n').trim(),
      chapterNumber: chapters.length + 1,
    })
  }

  // Prepend preamble to first chapter if any
  if (preambleLines.length > 0 && chapters.length > 0) {
    const preamble = preambleLines.join('\n').trim()
    if (preamble) {
      chapters[0].content = preamble + '\n\n' + chapters[0].content
    }
  }

  return chapters
}
