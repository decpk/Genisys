import { persistNotesAppState } from '../persistence/persistNotesAppState'
import type { NotesAppGet, NotesAppSet } from './action-context.types'

/**
 * Drops a split that references notes which no longer exist (e.g. after a note
 * was deleted while persisted). Keeps the surviving pane when only one note is
 * missing; clears the split entirely when both are gone.
 */
export function reconcileSplitWithNotesAction(
  get: NotesAppGet,
  set: NotesAppSet,
  validNoteIds: Set<string>,
): void {
  const state = get()
  if (!state.splitState) return

  const [first, second] = state.splitState.panes
  const firstValid = validNoteIds.has(first.noteId)
  const secondValid = validNoteIds.has(second.noteId)

  if (firstValid && secondValid) return

  if (!firstValid && !secondValid) {
    set({ splitState: null })
    persistNotesAppState(get)
    return
  }

  const survivor = firstValid ? first : second
  set({ splitState: null, selectedNoteId: survivor.noteId })
  persistNotesAppState(get)
}
