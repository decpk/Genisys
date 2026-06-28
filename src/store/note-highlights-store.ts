import { create } from 'zustand'

import { addHighlightAction } from './note-highlights-store/actions/addHighlight'
import { loadHighlightsAction } from './note-highlights-store/actions/loadHighlights'
import { reconcileHighlightsAction } from './note-highlights-store/actions/reconcileHighlights'
import { removeHighlightAction } from './note-highlights-store/actions/removeHighlight'
import { removeHighlightsInRangeAction } from './note-highlights-store/actions/removeHighlightsInRange'

export interface NoteHighlight {
  id: string
  noteId: string
  text: string
  fromPos: number
  toPos: number
  note: string
  createdAt: string
  updatedAt: string
}

export interface HighlightDraft {
  text: string
  fromPos: number
  toPos: number
}

export interface NoteHighlightsState {
  highlightsByNote: Record<string, NoteHighlight[]>
  loadingNotes: Set<string>
}

export interface NoteHighlightsActions {
  loadHighlights: (noteId: string) => Promise<void>
  addHighlight: (input: {
    noteId: string
    text: string
    fromPos: number
    toPos: number
  }) => Promise<NoteHighlight>
  removeHighlight: (id: string, noteId: string) => Promise<void>
  removeHighlightsInRange: (noteId: string, fromPos: number, toPos: number) => Promise<void>
  reconcileHighlights: (noteId: string, drafts: HighlightDraft[]) => Promise<void>
}

export const useNoteHighlightsStore = create<NoteHighlightsState & NoteHighlightsActions>()(
  (set, get) => ({
    highlightsByNote: {},
    loadingNotes: new Set(),

    loadHighlights: (noteId) => loadHighlightsAction(get, set, noteId),
    addHighlight: (input) => addHighlightAction(get, set, input),
    removeHighlight: (id, noteId) => removeHighlightAction(get, set, id, noteId),
    removeHighlightsInRange: (noteId, fromPos, toPos) =>
      removeHighlightsInRangeAction(get, set, noteId, fromPos, toPos),
    reconcileHighlights: (noteId, drafts) => reconcileHighlightsAction(get, set, noteId, drafts),
  })
)
