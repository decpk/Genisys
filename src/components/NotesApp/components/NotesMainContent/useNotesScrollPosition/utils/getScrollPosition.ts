import { readScrollPositions } from './readScrollPositions'

/** Returns the saved scrollTop for a note, or undefined if none stored. */
export function getScrollPosition(noteId: string): number | undefined {
  if (!noteId) {
    return undefined
  }

  const map = readScrollPositions()
  const value = map[noteId]

  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}
