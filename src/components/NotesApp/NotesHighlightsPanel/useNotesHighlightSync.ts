import { useEffect, useRef } from 'react'
import type { Editor } from '@tiptap/react'

import { useNoteHighlightsStore } from '@/store/note-highlights-store'

import { extractHighlightMarks } from './utils/extractHighlightMarks'

/**
 * Self-heals the Highlights DB for a note: once the editor is ready and the
 * note's highlights are loaded, it extracts the highlight marks actually
 * present in the document and reconciles them into the store/DB (creating any
 * rows that were lost). Runs once per (noteId, editor) pairing.
 */
export function useNotesHighlightSync(editor: Editor | null, noteId: string | null): void {
  const loadHighlights = useNoteHighlightsStore((s) => s.loadHighlights)
  const reconcileHighlights = useNoteHighlightsStore((s) => s.reconcileHighlights)
  const syncedKeyRef = useRef<string | null>(null)

  useEffect(() => {
    if (!editor || editor.isDestroyed || !noteId) return
    const key = noteId
    if (syncedKeyRef.current === key) return
    syncedKeyRef.current = key

    let cancelled = false
    void (async () => {
      await loadHighlights(noteId)
      if (cancelled || editor.isDestroyed) return
      // Defer one frame so the markdown content has fully parsed into marks.
      requestAnimationFrame(() => {
        if (cancelled || editor.isDestroyed) return
        const drafts = extractHighlightMarks(editor)
        if (drafts.length === 0) return
        void reconcileHighlights(noteId, drafts)
      })
    })()

    return () => {
      cancelled = true
    }
  }, [editor, noteId, loadHighlights, reconcileHighlights])
}
