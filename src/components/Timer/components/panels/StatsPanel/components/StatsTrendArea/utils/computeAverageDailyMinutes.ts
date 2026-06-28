import type { DailySeriesPoint } from './computeDailySeries'

/**
 * Average minutes across all days in the series. Empty series returns 0.
 * Includes zero-minute days so the average reflects the full window
 * (matching how DailyPlan's FocusTimeTrend computes "avg/day").
 */
export function computeAverageDailyMinutes(
  series: DailySeriesPoint[],
): number {
  if (!series.length) return 0
  let sum = 0
  for (const p of series) {
    if (Number.isFinite(p.minutes) && p.minutes > 0) sum += p.minutes
  }
  return Math.round(sum / series.length)
}
