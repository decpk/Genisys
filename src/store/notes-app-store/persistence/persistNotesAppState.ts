import { writePersistedNotesApp } from './writePersistedNotesApp'
import type { NotesAppGet } from '../actions/action-context.types'

/** Persists the current Notes-app state (selected note + split layout). */
export function persistNotesAppState(get: NotesAppGet): void {
  const state = get()
  writePersistedNotesApp({
    selectedNoteId: state.selectedNoteId,
    splitState: state.splitState,
  })
}
