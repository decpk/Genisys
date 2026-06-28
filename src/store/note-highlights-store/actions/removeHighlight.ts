import type { StoreApi } from 'zustand'

import type { NoteHighlightsActions, NoteHighlightsState } from '../../note-highlights-store'

type Store = NoteHighlightsState & NoteHighlightsActions

export async function removeHighlightAction(
  _get: StoreApi<Store>['getState'],
  set: StoreApi<Store>['setState'],
  id: string,
  noteId: string
): Promise<void> {
  set((s) => {
    const existing = s.highlightsByNote[noteId]
    if (!existing) return {}
    return {
      highlightsByNote: {
        ...s.highlightsByNote,
        [noteId]: existing.filter((h) => h.id !== id),
      },
    }
  })

  await window.api.removeNoteHighlight(id)
}
