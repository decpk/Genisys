import { SCROLL_POSITION_STORAGE_KEY } from '../useNotesScrollPosition.constants'
import type { ScrollPositionMap } from '../useNotesScrollPosition.types'

/** Persists the note-id -> scrollTop map to localStorage. Swallows quota/serialization errors. */
export function writeScrollPositions(map: ScrollPositionMap): void {
  try {
    localStorage.setItem(SCROLL_POSITION_STORAGE_KEY, JSON.stringify(map))
  } catch {
    // Ignore quota/serialization errors silently.
  }
}
