import type { HighlightDraft, NoteHighlight } from '../../note-highlights-store'

/**
 * Returns the subset of `drafts` (highlight marks extracted from the editor)
 * that have no corresponding row in `existing`. Matching is by exact text,
 * count-aware: if a given text appears in N marks but only M (<N) DB rows,
 * the (N - M) extra marks are returned as missing. This avoids creating
 * duplicate rows while still recovering genuinely-lost highlights, including
 * the same text highlighted in multiple places.
 */
export function diffMissingHighlights(
  existing: NoteHighlight[],
  drafts: HighlightDraft[],
): HighlightDraft[] {
  // Count existing rows per exact text.
  const remaining = new Map<string, number>()
  for (const h of existing) {
    remaining.set(h.text, (remaining.get(h.text) ?? 0) + 1)
  }
  const missing: HighlightDraft[] = []
  for (const d of drafts) {
    const count = remaining.get(d.text) ?? 0
    if (count > 0) {
      remaining.set(d.text, count - 1) // covered by an existing row
    } else {
      missing.push(d)
    }
  }
  return missing
}
