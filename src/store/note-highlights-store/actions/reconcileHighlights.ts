import type { StoreApi } from 'zustand'

import type {
  HighlightDraft,
  NoteHighlight,
  NoteHighlightsActions,
  NoteHighlightsState,
} from '../../note-highlights-store'
import { diffMissingHighlights } from '../utils/diffMissingHighlights'

type Store = NoteHighlightsState & NoteHighlightsActions

export async function reconcileHighlightsAction(
  get: StoreApi<Store>['getState'],
  set: StoreApi<Store>['setState'],
  noteId: string,
  drafts: HighlightDraft[]
): Promise<void> {
  const existing = get().highlightsByNote[noteId] ?? []
  const missing = diffMissingHighlights(existing, drafts)
  if (missing.length === 0) return

  const now = new Date().toISOString()
  const created: NoteHighlight[] = missing.map((d) => ({
    id: crypto.randomUUID(),
    noteId,
    text: d.text,
    fromPos: d.fromPos,
    toPos: d.toPos,
    note: '',
    createdAt: now,
    updatedAt: now,
  }))

  set((s) => {
    const current = s.highlightsByNote[noteId] ?? []
    return {
      highlightsByNote: {
        ...s.highlightsByNote,
        [noteId]: [...created, ...current],
      },
    }
  })

  for (const h of created) {
    await window.api.saveNoteHighlight(h)
  }
}
