import type { StoreApi } from 'zustand'

import type {
  NoteHighlight,
  NoteHighlightsActions,
  NoteHighlightsState,
} from '../../note-highlights-store'

type Store = NoteHighlightsState & NoteHighlightsActions

export async function loadHighlightsAction(
  get: StoreApi<Store>['getState'],
  set: StoreApi<Store>['setState'],
  noteId: string
): Promise<void> {
  if (get().highlightsByNote[noteId] || get().loadingNotes.has(noteId)) return

  set((s) => ({ loadingNotes: new Set(s.loadingNotes).add(noteId) }))

  try {
    const list = (await window.api.loadNoteHighlights(noteId)) as NoteHighlight[]
    set((s) => {
      const next = new Set(s.loadingNotes)
      next.delete(noteId)
      return {
        highlightsByNote: { ...s.highlightsByNote, [noteId]: list },
        loadingNotes: next,
      }
    })
  } catch {
    set((s) => {
      const next = new Set(s.loadingNotes)
      next.delete(noteId)
      return {
        highlightsByNote: { ...s.highlightsByNote, [noteId]: [] },
        loadingNotes: next,
      }
    })
  }
}
