import type { StoreApi } from 'zustand'

import type {
  NoteHighlight,
  NoteHighlightsActions,
  NoteHighlightsState,
} from '../../note-highlights-store'

type Store = NoteHighlightsState & NoteHighlightsActions

export async function addHighlightAction(
  _get: StoreApi<Store>['getState'],
  set: StoreApi<Store>['setState'],
  input: { noteId: string; text: string; fromPos: number; toPos: number }
): Promise<NoteHighlight> {
  const now = new Date().toISOString()
  const highlight: NoteHighlight = {
    id: crypto.randomUUID(),
    noteId: input.noteId,
    text: input.text,
    fromPos: input.fromPos,
    toPos: input.toPos,
    note: '',
    createdAt: now,
    updatedAt: now,
  }

  set((s) => {
    const existing = s.highlightsByNote[input.noteId] ?? []
    return {
      highlightsByNote: {
        ...s.highlightsByNote,
        [input.noteId]: [highlight, ...existing],
      },
    }
  })

  await window.api.saveNoteHighlight(highlight)

  return highlight
}
