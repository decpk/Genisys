import type { KeyCombo } from '../../KeyboardShortcut.types'

import { chordStateRef } from './chordStateRef'

export function getChordPrefix(): KeyCombo | null {
  return chordStateRef.prefix
}
