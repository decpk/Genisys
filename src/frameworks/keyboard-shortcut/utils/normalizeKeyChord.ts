import { normalizeKeyString } from './normalizeKeyString'

/**
 * Normalize a chord shortcut string. Each combo is normalized via
 * normalizeKeyString and joined with a single space.
 *
 *   "Mod+K W" → "mod+k w"
 *   "MOD+W"   → "mod+w"
 */
export function normalizeKeyChord(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  return trimmed
    .split(/\s+/)
    .map((segment) => normalizeKeyString(segment))
    .join(' ')
}
