import type { KeyCombo } from '../../KeyboardShortcut.types'

/**
 * Module-level mutable state holding the chord prefix that is
 * currently waiting for its second key. Internal — consumers should
 * use the getChordPrefix / setChordPrefix / clearChordPrefix helpers.
 */
export interface ChordStateRef {
  prefix: KeyCombo | null
  timeoutId: ReturnType<typeof setTimeout> | null
}

export const chordStateRef: ChordStateRef = {
  prefix: null,
  timeoutId: null,
}
