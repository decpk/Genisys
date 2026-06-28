import { persistNotesAppState } from '../persistence/persistNotesAppState'
import type { NotesMode } from '@/store/settings-store'

import type { NotesPaneIndex } from '../notes-app-store.types'
import type { NotesAppGet, NotesAppSet } from './action-context.types'

/** Sets the view/edit mode for a single pane (independent of the other pane). */
export function setPaneModeAction(
  get: NotesAppGet,
  set: NotesAppSet,
  index: NotesPaneIndex,
  mode: NotesMode,
): void {
  const state = get()
  if (!state.splitState) return
  const panes = [...state.splitState.panes] as typeof state.splitState.panes
  panes[index] = { ...panes[index], mode }
  set({ splitState: { ...state.splitState, panes } })
  persistNotesAppState(get)
}
