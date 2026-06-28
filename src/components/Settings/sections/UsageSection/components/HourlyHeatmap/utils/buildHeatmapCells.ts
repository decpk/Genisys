import type { UsageHourStat } from '@/lib/usage'

import type { HeatmapCell } from '../HourlyHeatmap.types'

const LABELLED_HOURS = new Set([0, 6, 12, 18])

/**
 * Produces a dense 24-cell array (one per hour), normalising each hour's
 * foreground time to a 0..1 intensity relative to the busiest hour.
 */
export function buildHeatmapCells(perHour: UsageHourStat[]): HeatmapCell[] {
  const byHour = new Map<number, number>()
  for (const stat of perHour) {
    byHour.set(stat.hour, stat.foregroundMs)
  }

  let max = 0
  for (const ms of byHour.values()) {
    if (ms > max) max = ms
  }

  const cells: HeatmapCell[] = []
  for (let hour = 0; hour < 24; hour += 1) {
    const foregroundMs = byHour.get(hour) ?? 0
    const intensity = max > 0 ? foregroundMs / max : 0
    cells.push({
      hour,
      foregroundMs,
      intensity,
      showLabel: LABELLED_HOURS.has(hour),
    })
  }

  return cells
}
