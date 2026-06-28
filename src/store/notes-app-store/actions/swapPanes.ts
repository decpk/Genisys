import { persistNotesAppState } from '../persistence/persistNotesAppState'
import { otherPaneIndex } from '../utils/otherPaneIndex'
import type { NotesPaneState } from '../notes-app-store.types'
import type { NotesAppGet, NotesAppSet } from './action-context.types'

/**
 * Swaps the two panes. The divider ratio is mirrored and the active pane index
 * flips so the same note stays focused in its new position.
 */
export function swapPanesAction(get: NotesAppGet, set: NotesAppSet): void {
  const state = get()
  if (!state.splitState) return
  const { panes, ratio, activeIndex } = state.splitState
  const swapped: [NotesPaneState, NotesPaneState] = [panes[1], panes[0]]
  set({
    splitState: {
      ...state.splitState,
      panes: swapped,
      ratio: 1 - ratio,
      activeIndex: otherPaneIndex(activeIndex),
    },
  })
  persistNotesAppState(get)
}
