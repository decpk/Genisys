import type { NotesPaneIndex } from '../notes-app-store.types'

/** Returns the index of the opposite pane in a two-pane split. */
export function otherPaneIndex(index: NotesPaneIndex): NotesPaneIndex {
  return index === 0 ? 1 : 0
}
