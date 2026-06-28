import type { KeyCombo } from '../KeyboardShortcut.types'

import { parseKeyCombo } from './parseKeyCombo'

/**
 * Cache of parsed chords keyed by the raw shortcut string. Shortcut key
 * strings are static (definitions + user overrides), so each distinct
 * string is parsed once instead of on every keydown. Callers treat the
 * returned arrays as read-only.
 */
const chordCache = new Map<string, KeyCombo[]>()

/**
 * Parse a shortcut string into a chord (sequence of key combos).
 *
 *   "Mod+W"     → [{ mod, key: 'w' }]
 *   "Mod+K W"   → [{ mod, key: 'k' }, { key: 'w' }]
 *
 * Combos are separated by whitespace; each combo is parsed by parseKeyCombo.
 * Empty input returns an empty array. Results are memoized by input string.
 */
export function parseKeyChord(shortcutString: string): KeyCombo[] {
  const cached = chordCache.get(shortcutString)
  if (cached) return cached

  const trimmed = shortcutString.trim()
  const chord = trimmed ? trimmed.split(/\s+/).map((segment) => parseKeyCombo(segment)) : []
  chordCache.set(shortcutString, chord)
  return chord
}
