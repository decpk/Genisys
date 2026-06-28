import type { CompletionHeatmapCell } from '../ProductivityAnalytics.types'

/**
 * Build a heatmap of task completions by day-of-week × hour-of-day.
 * Uses the `completedAt` ISO timestamp on each task.
 * Returns a flat array of cells (day 0=Mon..6=Sun, hour 0-23).
 */
export function computeCompletionHeatmap(
  allTasks: Record<string, unknown>[],
): CompletionHeatmapCell[] {
  // Initialize 7×24 grid
  const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0))

  for (const t of allTasks) {
    const completedAt = (t as any).completedAt as string | null | undefined
    if (!completedAt) continue

    const date = new Date(completedAt)
    if (isNaN(date.getTime())) continue

    const jsDay = date.getDay() // 0=Sun, 1=Mon, ..., 6=Sat
    // Convert to Mon=0, Tue=1, ..., Sun=6
    const day = jsDay === 0 ? 6 : jsDay - 1
    const hour = date.getHours()
    grid[day][hour]++
  }

  const cells: CompletionHeatmapCell[] = []
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      if (grid[day][hour] > 0) {
        cells.push({ day, hour, count: grid[day][hour] })
      }
    }
  }

  return cells
}
