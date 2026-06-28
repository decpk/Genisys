import { MAX_STORED_POSITIONS } from '../useNotesScrollPosition.constants'
import { readScrollPositions } from './readScrollPositions'
import { writeScrollPositions } from './writeScrollPositions'
import { pruneScrollPositions } from './pruneScrollPositions'

/** Saves a note's scrollTop, re-inserting the key so it counts as most-recent, then prunes + writes. */
export function setScrollPosition(noteId: string, scrollTop: number): void {
  if (!noteId || typeof scrollTop !== 'number' || !Number.isFinite(scrollTop)) {
    return
  }

  const map = readScrollPositions()
  delete map[noteId]
  map[noteId] = scrollTop

  writeScrollPositions(pruneScrollPositions(map, MAX_STORED_POSITIONS))
}
