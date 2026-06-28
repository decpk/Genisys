import { readPersistedNotesApp } from '../persistence/readPersistedNotesApp'
import { isValidSplitState } from './isValidSplitState'
import { clampSplitRatio } from './clampSplitRatio'
import type { NotesSplitState } from '../notes-app-store.types'

/**
 * Reads and validates the persisted split layout for store initialisation.
 * Note-existence is reconciled separately once notes have loaded.
 */
export function readInitialSplitState(): NotesSplitState | null {
  const persisted = readPersistedNotesApp()
  const candidate = persisted?.splitState
  if (!isValidSplitState(candidate)) return null
  return { ...candidate, ratio: clampSplitRatio(candidate.ratio) }
}
