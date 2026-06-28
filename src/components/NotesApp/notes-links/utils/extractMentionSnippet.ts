import { stripMarkdown } from './stripMarkdown'

const RADIUS = 60

/**
 * Build a short plain-text snippet centered on the first plain-text occurrence
 * of `title` inside `content` (used for unlinked mentions).
 */
export function extractMentionSnippet(content: string, title: string): string {
  const plain = stripMarkdown(content)
  const needle = title.trim().toLowerCase()
  const idx = plain.toLowerCase().indexOf(needle)
  if (idx === -1) return plain.slice(0, 120)
  const start = Math.max(0, idx - RADIUS)
  const end = Math.min(plain.length, idx + needle.length + RADIUS)
  const prefix = start > 0 ? '… ' : ''
  const suffix = end < plain.length ? ' …' : ''
  return `${prefix}${plain.slice(start, end)}${suffix}`
}
