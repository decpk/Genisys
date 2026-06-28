import type { Editor } from '@tiptap/react'

import type { NoteHighlight } from '@/store/note-highlights-store'

/**
 * Resolves the live ProseMirror range for a stored highlight, robust against
 * later edits. It re-searches the document text for `highlight.text` and picks
 * the occurrence whose start position is nearest to the stored `fromPos`.
 *
 * Position math: in ProseMirror, a text node reports `pos` as the document
 * position immediately BEFORE the node. The character at `node.text[index]`
 * therefore lives at document position `pos + index`, so a substring starting
 * at `index` spans `{ from: pos + index, to: pos + index + length }`.
 */
export function resolveHighlightPos(
  editor: Editor | null,
  highlight: NoteHighlight,
): { from: number; to: number } | null {
  if (!editor || !highlight.text) return null

  const needle = highlight.text
  const needleLength = needle.length

  let best: { from: number; to: number } | null = null
  let bestDistance = Number.POSITIVE_INFINITY

  editor.state.doc.descendants((node, pos) => {
    if (!node.isText || !node.text) return
    const haystack = node.text

    let searchIndex = haystack.indexOf(needle)
    while (searchIndex !== -1) {
      const from = pos + searchIndex
      const to = from + needleLength
      const distance = Math.abs(from - highlight.fromPos)
      if (distance < bestDistance) {
        bestDistance = distance
        best = { from, to }
      }
      searchIndex = haystack.indexOf(needle, searchIndex + 1)
    }
  })

  if (best) return best

  // Fallback: clamp the stored positions to the current document size.
  const size = editor.state.doc.content.size
  const from = Math.min(highlight.fromPos, size)
  const to = Math.min(highlight.toPos, size)
  return from < to ? { from, to } : null
}
