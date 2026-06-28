import type { StatsTagBreakdown } from '../../../StatsPanel.types'

export interface TopTag {
  label: string
  minutes: number
}

/**
 * Returns the highest-minute entry from the per-tag breakdown, or `null`
 * when no entry has positive minutes. Empty / missing labels fall back to
 * "Untagged" so the caller can render a label without further checks.
 */
export function findTopTag(perTag: StatsTagBreakdown[]): TopTag | null {
  let best: TopTag | null = null
  for (const t of perTag) {
    if (!t || !Number.isFinite(t.minutes) || t.minutes <= 0) continue
    const label = t.label && t.label.trim().length > 0 ? t.label : 'Untagged'
    if (!best || t.minutes > best.minutes) {
      best = { label, minutes: t.minutes }
    }
  }
  return best
}
