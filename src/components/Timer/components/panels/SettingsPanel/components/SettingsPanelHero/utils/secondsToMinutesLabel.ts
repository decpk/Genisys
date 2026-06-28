/**
 * Convert seconds to a compact minutes label, rounded to the nearest minute.
 * Returns the integer minutes (no unit). Used by HeroDurationPills.
 */
export function secondsToMinutesLabel(seconds: number): number {
  if (!Number.isFinite(seconds) || seconds <= 0) return 0
  return Math.max(1, Math.round(seconds / 60))
}
