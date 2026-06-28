import { persistNotesAppState } from '../persistence/persistNotesAppState'
import type { NotesPaneIndex } from '../notes-app-store.types'
import type { NotesAppGet, NotesAppSet } from './action-context.types'

/**
 * Focuses a pane, syncing `selectedNoteId` to it so the shared right panel
 * (TOC / highlights / AI) follows the focused note.
 */
export function setActivePaneAction(
  get: NotesAppGet,
  set: NotesAppSet,
  index: NotesPaneIndex,
): void {
  const state = get()
  if (!state.splitState) return
  if (state.splitState.activeIndex === index) return
  set({
    splitState: { ...state.splitState, activeIndex: index },
    selectedNoteId: state.splitState.panes[index].noteId,
  })
  persistNotesAppState(get)
}
