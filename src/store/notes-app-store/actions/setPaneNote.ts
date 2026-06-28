import { persistNotesAppState } from '../persistence/persistNotesAppState'
import { otherPaneIndex } from '../utils/otherPaneIndex'
import type { NotesPaneIndex } from '../notes-app-store.types'
import type { NotesAppGet, NotesAppSet } from './action-context.types'

/**
 * Replaces the note shown in a pane (e.g. dropping a different note onto an
 * already-split pane) and focuses it. No-ops if the other pane already shows
 * that note, since the same note may not appear in both panes.
 */
export function setPaneNoteAction(
  get: NotesAppGet,
  set: NotesAppSet,
  index: NotesPaneIndex,
  noteId: string,
): void {
  const state = get()
  if (!state.splitState) return

  const other = otherPaneIndex(index)
  if (state.splitState.panes[other].noteId === noteId) return
  if (state.splitState.panes[index].noteId === noteId) return

  const panes = [...state.splitState.panes] as typeof state.splitState.panes
  panes[index] = { ...panes[index], noteId }
  set({
    splitState: { ...state.splitState, panes, activeIndex: index },
    selectedNoteId: noteId,
  })
  persistNotesAppState(get)
}
