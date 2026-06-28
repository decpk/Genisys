import { NOTES_APP_STORAGE_KEY } from '../constants'
import type { NotesAppPersistedShape } from '../notes-app-store.types'

/** Reads the persisted Notes-app state from localStorage. Returns null when absent or invalid. */
export function readPersistedNotesApp(): NotesAppPersistedShape | null {
  try {
    const raw = localStorage.getItem(NOTES_APP_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as NotesAppPersistedShape
    if (typeof parsed !== 'object' || parsed === null) return null
    return parsed
  } catch {
    return null
  }
}
