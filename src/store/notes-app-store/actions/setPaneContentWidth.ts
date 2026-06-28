import { persistNotesAppState } from '../persistence/persistNotesAppState'
import type { ContentWidth } from '@/store/settings-store'

import type { NotesPaneIndex } from '../notes-app-store.types'
import type { NotesAppGet, NotesAppSet } from './action-context.types'

/** Sets the content width for a single pane (independent of the other pane). */
export function setPaneContentWidthAction(
  get: NotesAppGet,
  set: NotesAppSet,
  index: NotesPaneIndex,
  contentWidth: ContentWidth,
): void {
  const state = get()
  if (!state.splitState) return
  const panes = [...state.splitState.panes] as typeof state.splitState.panes
  panes[index] = { ...panes[index], contentWidth }
  set({ splitState: { ...state.splitState, panes } })
  persistNotesAppState(get)
}
