import { useNotesStore, type Note } from '@/store/notes-store'
import { NOTES_SCOPE_KEY } from '../notes-links.constants'

/** Read the current Notes-app notes straight from the store (non-reactive). */
export function getAllNotes(): Note[] {
  return useNotesStore.getState().notesByScope[NOTES_SCOPE_KEY] ?? []
}
