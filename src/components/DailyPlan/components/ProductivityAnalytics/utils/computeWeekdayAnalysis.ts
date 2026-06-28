import type { WeekdayAnalysis } from '../ProductivityAnalytics.types'

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/**
 * Compute average task completion rate per day of week.
 * dayIndex: 0=Mon, 1=Tue, ..., 6=Sun
 */
export function computeWeekdayAnalysis(
  tasksByDate: Record<string, Record<string, unknown>[]>,
): WeekdayAnalysis[] {
  // Accumulate per weekday
  const buckets: Array<{ totalTasks: number; totalCompleted: number; dayCount: number }> =
    Array.from({ length: 7 }, () => ({ totalTasks: 0, totalCompleted: 0, dayCount: 0 }))

  const processedDates = new Set<string>()

  for (const [dateStr, tasks] of Object.entries(tasksByDate)) {
    if (processedDates.has(dateStr)) continue
    processedDates.add(dateStr)

    const date = new Date(dateStr + 'T00:00:00')
    if (isNaN(date.getTime())) continue

    const jsDay = date.getDay() // 0=Sun
    const dayIndex = jsDay === 0 ? 6 : jsDay - 1 // Mon=0 ... Sun=6

    const total = tasks.length
    const completed = tasks.filter((t) => (t as any).status === 'completed').length

    if (total > 0) {
      buckets[dayIndex].totalTasks += total
      buckets[dayIndex].totalCompleted += completed
      buckets[dayIndex].dayCount++
    }
  }

  return buckets.map((b, i) => ({
    day: i,
    label: WEEKDAY_LABELS[i],
    avgCompletionPct: b.dayCount > 0
      ? Math.round((b.totalCompleted / b.totalTasks) * 100)
      : 0,
    totalTasks: b.totalTasks,
    totalCompleted: b.totalCompleted,
    dayCount: b.dayCount,
  }))
}
