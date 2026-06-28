import type { DayOfWeekStat } from './computeDayOfWeekStats'

/**
 * Returns the index (within the input array) of the day with the highest
 * `avgMinutes`. Returns -1 when no day has any minutes.
 */
export function findBestDayOfWeek(stats: DayOfWeekStat[]): number {
  let bestIdx = -1
  let bestAvg = 0
  for (let i = 0; i < stats.length; i++) {
    const s = stats[i]
    if (s.avgMinutes > bestAvg) {
      bestAvg = s.avgMinutes
      bestIdx = i
    }
  }
  return bestIdx
}
