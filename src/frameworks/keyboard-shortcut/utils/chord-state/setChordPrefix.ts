import type { KeyCombo } from '../../KeyboardShortcut.types'

import { CHORD_TIMEOUT_MS } from '../../KeyboardShortcut.constants'

import { chordStateRef } from './chordStateRef'
import { clearChordPrefix } from './clearChordPrefix'

/**
 * Set a pending chord prefix. Auto-clears after CHORD_TIMEOUT_MS.
 */
export function setChordPrefix(combo: KeyCombo): void {
  clearChordPrefix()
  chordStateRef.prefix = combo
  chordStateRef.timeoutId = setTimeout(() => {
    clearChordPrefix()
  }, CHORD_TIMEOUT_MS)
}
