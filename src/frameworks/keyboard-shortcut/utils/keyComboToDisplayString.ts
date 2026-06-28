import { parseShortcut } from '@/lib/keyboard'

// ── Display string ───────────────────────────────────────────────────

/**
 * Convert a shortcut string into an array of display-ready key symbols.
 * Chord shortcuts (e.g. "Mod+K W") get a single-space separator entry
 * between combos so the renderer can show a visual gap.
 */
export function keyComboToDisplayString(shortcutString: string): string[] {
  const trimmed = shortcutString.trim()
  if (!trimmed) return []
  const combos = trimmed.split(/\s+/)
  if (combos.length === 1) return parseShortcut(combos[0])

  const result: string[] = []
  for (let i = 0; i < combos.length; i++) {
    if (i > 0) result.push(' ')
    result.push(...parseShortcut(combos[i]))
  }
  return result
}
