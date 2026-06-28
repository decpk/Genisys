import type { EditorState } from '@tiptap/pm/state'

const MAX_CONTEXT = 500

/**
 * Extract plain text before the cursor from the ProseMirror document.
 * Uses `doc.textBetween` which is O(1) relative to document size —
 * only the window around the cursor is traversed.
 */
export function extractContext(state: EditorState, maxLength: number = MAX_CONTEXT): string {
  const { from } = state.selection
  const start = Math.max(0, from - maxLength)
  return state.doc.textBetween(start, from, '\n', '\0')
}
