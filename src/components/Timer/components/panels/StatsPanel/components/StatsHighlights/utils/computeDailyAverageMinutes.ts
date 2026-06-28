/**
 * Daily-average minutes given a total minute count over `days` days. The
 * window includes zero-minute days so the result reflects effort spread,
 * not just productive-day average. Non-positive `days` returns 0.
 */
export function computeDailyAverageMinutes(
  totalMinutes: number,
  days: number,
): number {
  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) return 0
  if (!Number.isFinite(days) || days <= 0) return 0
  return Math.round(totalMinutes / days)
}
