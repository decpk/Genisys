import { persistNotesAppState } from '../persistence/persistNotesAppState'
import type { NotesSplitOrientation } from '../notes-app-store.types'
import type { NotesAppGet, NotesAppSet } from './action-context.types'

/** Changes the orientation (side-by-side / stacked) of the active split. */
export function setSplitOrientationAction(
  get: NotesAppGet,
  set: NotesAppSet,
  orientation: NotesSplitOrientation,
): void {
  const state = get()
  if (!state.splitState) return
  set({ splitState: { ...state.splitState, orientation } })
  persistNotesAppState(get)
}
