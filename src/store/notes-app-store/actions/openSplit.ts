import { persistNotesAppState } from '../persistence/persistNotesAppState'
import { createPaneState } from '../utils/createPaneState'
import { NOTES_SPLIT_DEFAULT_RATIO } from '../split.constants'
import type {
  NotesPaneIndex,
  NotesPaneState,
  NotesSplitOrientation,
  NotesSplitSide,
  NotesSplitState,
} from '../notes-app-store.types'
import type { NotesAppGet, NotesAppSet } from './action-context.types'

/**
 * Opens a two-pane split between the currently active note and `noteId`.
 * Falls back to plain selection when there is no other note to split against.
 */
export function openSplitAction(
  get: NotesAppGet,
  set: NotesAppSet,
  noteId: string,
  orientation: NotesSplitOrientation,
  side: NotesSplitSide,
): void {
  const state = get()
  const baseId = state.splitState
    ? state.splitState.panes[state.splitState.activeIndex].noteId
    : state.selectedNoteId

  if (!baseId || baseId === noteId) {
    set({ selectedNoteId: noteId })
    persistNotesAppState(get)
    return
  }

  const basePane = createPaneState(baseId)
  const droppedPane = createPaneState(noteId)
  const panes: [NotesPaneState, NotesPaneState] =
    side === 'first' ? [droppedPane, basePane] : [basePane, droppedPane]
  const activeIndex: NotesPaneIndex = side === 'first' ? 0 : 1

  const splitState: NotesSplitState = {
    panes,
    orientation,
    ratio: NOTES_SPLIT_DEFAULT_RATIO,
    activeIndex,
  }

  set({ splitState, selectedNoteId: panes[activeIndex].noteId })
  persistNotesAppState(get)
}
