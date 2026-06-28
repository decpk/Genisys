import { normalizeNoteTitle } from './normalizeNoteTitle'
import { stripMarkdown } from './stripMarkdown'

const RADIUS = 60

/**
 * Build a short plain-text snippet centered on the first `[[targetTitle]]`
 * occurrence inside `content`. Falls back to the content head when no explicit
 * link token is found.
 */
export function extractBacklinkSnippet(
  content: string,
  targetTitle: string,
): string {
  if (!content) return ''
  const target = normalizeNoteTitle(targetTitle)
  const re = /\[\[([^\]\n]+?)\]\]/g
  let match: RegExpExecArray | null
  while ((match = re.exec(content)) !== null) {
    if (normalizeNoteTitle(match[1]) !== target) continue
    const start = Math.max(0, match.index - RADIUS)
    const end = Math.min(content.length, match.index + match[0].length + RADIUS)
    const snippet = stripMarkdown(content.slice(start, end))
    const prefix = start > 0 ? '… ' : ''
    const suffix = end < content.length ? ' …' : ''
    return `${prefix}${snippet}${suffix}`
  }
  return stripMarkdown(content).slice(0, 120)
}
