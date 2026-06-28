import { chordStateRef } from './chordStateRef'

export function clearChordPrefix(): void {
  if (chordStateRef.timeoutId !== null) {
    clearTimeout(chordStateRef.timeoutId)
    chordStateRef.timeoutId = null
  }
  chordStateRef.prefix = null
}
