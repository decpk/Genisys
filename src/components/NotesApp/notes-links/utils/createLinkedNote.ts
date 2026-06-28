import { useNotesStore } from '@/store/notes-store'
import { useSettingsStore } from '@/store/settings-store'
import {
  NOTES_APP_ID,
  NOTES_SCOPE_ID,
  NOTES_SCOPE_TYPE,
} from '../notes-links.constants'

/**
 * Create a new note titled `title` in the default Notes scope so a wiki link
 * pointing at it resolves immediately. Returns the new note id.
 */
export async function createLinkedNote(title: string): Promise<string> {
  const store = useNotesStore.getState()
  const note = await store.addNote(NOTES_APP_ID, NOTES_SCOPE_TYPE, NOTES_SCOPE_ID)
  await store.updateNote({ ...note, title })
  // New notes open in Edit mode (single-pane view derives mode from global notesMode).
  useSettingsStore.getState().setNotesMode('edit')
  return note.id
}
