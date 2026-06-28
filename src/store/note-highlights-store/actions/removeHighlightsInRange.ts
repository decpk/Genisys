import type { StoreApi } from 'zustand'

import type { NoteHighlightsActions, NoteHighlightsState } from '../../note-highlights-store'

type Store = NoteHighlightsState & NoteHighlightsActions

export async function removeHighlightsInRangeAction(
  _get: StoreApi<Store>['getState'],
  set: StoreApi<Store>['setState'],
  noteId: string,
  fromPos: number,
  toPos: number
): Promise<void> {
  set((s) => {
    const existing = s.highlightsByNote[noteId]
    if (!existing) return {}
    return {
      highlightsByNote: {
        ...s.highlightsByNote,
        [noteId]: existing.filter((h) => !(h.fromPos < toPos && h.toPos > fromPos)),
      },
    }
  })

  await window.api.removeNoteHighlightsInRange(noteId, fromPos, toPos)
}
