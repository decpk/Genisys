import { parseKeyCombo } from './parseKeyCombo'

// ── Normalize ────────────────────────────────────────────────────────

export function normalizeKeyString(raw: string): string {
  const combo = parseKeyCombo(raw)
  const parts: string[] = []

  if (combo.mod) parts.push('mod')
  if (combo.ctrl) parts.push('ctrl')
  if (combo.alt) parts.push('alt')
  if (combo.shift) parts.push('shift')
  parts.push(combo.key.toLowerCase())

  return parts.join('+')
}
