import { NOTES_APP_STORAGE_KEY } from '../constants'
import type { NotesAppPersistedShape } from '../notes-app-store.types'

const DEBOUNCE_MS = 300

let debounceHandle: ReturnType<typeof setTimeout> | null = null

/** Persists the Notes-app state to localStorage (debounced). */
export function writePersistedNotesApp(value: NotesAppPersistedShape): void {
  if (debounceHandle) clearTimeout(debounceHandle)
  debounceHandle = setTimeout(() => {
    try {
      localStorage.setItem(NOTES_APP_STORAGE_KEY, JSON.stringify(value))
    } catch {
      /* noop — storage may be full or unavailable */
    }
  }, DEBOUNCE_MS)
}
