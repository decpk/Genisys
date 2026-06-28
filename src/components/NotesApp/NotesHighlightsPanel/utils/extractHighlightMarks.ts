import type { Editor } from '@tiptap/react'

import type { HighlightDraft } from '@/store/note-highlights-store'

/**
 * Walks the document and returns one HighlightDraft per contiguous run of the
 * `highlight` mark. ProseMirror positions: a text node reports `pos` as the
 * position immediately before it, so a slice starting at character `index`
 * within the node text spans `{ from: pos + index, to: pos + index + len }`.
 * Adjacent highlighted text nodes are merged into a single range.
 */
export function extractHighlightMarks(editor: Editor): HighlightDraft[] {
  const drafts: HighlightDraft[] = []
  let current: { from: number; to: number; text: string } | null = null

  editor.state.doc.descendants((node, pos) => {
    const isHighlighted =
      node.isText && node.marks.some((m) => m.type.name === 'highlight')

    if (isHighlighted && node.text) {
      const from = pos
      const to = pos + node.text.length
      if (current && current.to === from) {
        // contiguous with the previous highlighted node — extend
        current.to = to
        current.text += node.text
      } else {
        if (current) drafts.push({ text: current.text, fromPos: current.from, toPos: current.to })
        current = { from, to, text: node.text }
      }
    } else if (current) {
      drafts.push({ text: current.text, fromPos: current.from, toPos: current.to })
      current = null
    }
  })

  if (current) drafts.push({ text: current.text, fromPos: current.from, toPos: current.to })

  // Ignore whitespace-only fragments to mirror the H-button capture guard.
  return drafts.filter((d) => d.text.trim().length > 0)
}
