/**
 * Sum of minutes in the 7-element weekly array. Tolerates missing/short
 * arrays and non-finite entries.
 */
export function computeWeeklyTotalMinutes(weekly: number[]): number {
  if (!Array.isArray(weekly) || weekly.length === 0) return 0
  let total = 0
  for (const m of weekly) {
    if (Number.isFinite(m) && m > 0) total += m
  }
  return total
}
