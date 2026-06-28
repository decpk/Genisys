import type { StatsTagBreakdown } from '../../../StatsPanel.types'
import { getTagColor } from './getTagColor'

export interface TagShareSlice {
  /** Stable key for React. */
  key: string
  /** Display label. Falls back to "Untagged" when label is empty/null. */
  label: string
  /** Original tag id from the breakdown (may be null). */
  tagId: string | null
  /** Minutes contributed by this slice. */
  minutes: number
  /** Pre-computed share percent 0-100, rounded to 1 decimal. */
  pct: number
  /** Hex / hsl string for fill. */
  color: string
}

/**
 * Converts the panel's `perTag` breakdown into pie-ready slices: skips
 * zero-minute entries, attaches a deterministic color per tag id, and
 * pre-computes share percents. Slices sorted by minutes descending.
 */
export function computeTagShareSlices(
  perTag: StatsTagBreakdown[],
): TagShareSlice[] {
  const cleaned = perTag.filter(
    (p) => Number.isFinite(p.minutes) && p.minutes > 0,
  )
  if (cleaned.length === 0) return []

  let total = 0
  for (const p of cleaned) total += p.minutes
  if (total <= 0) return []

  const slices: TagShareSlice[] = cleaned.map((p) => {
    const label = p.label && p.label.trim().length > 0 ? p.label : 'Untagged'
    const pct = Math.round((p.minutes / total) * 1000) / 10
    return {
      key: p.tagId ?? `__untagged__${label}`,
      label,
      tagId: p.tagId,
      minutes: p.minutes,
      pct,
      color: getTagColor(p.tagId),
    }
  })

  slices.sort((a, b) => b.minutes - a.minutes)
  return slices
}
