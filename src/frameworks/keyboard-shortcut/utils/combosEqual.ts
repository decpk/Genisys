import type { KeyCombo } from '../KeyboardShortcut.types'

/** Structural equality of two key combos. */
export function combosEqual(a: KeyCombo, b: KeyCombo): boolean {
  return (
    a.mod === b.mod &&
    a.ctrl === b.ctrl &&
    a.alt === b.alt &&
    a.shift === b.shift &&
    a.key === b.key
  )
}
