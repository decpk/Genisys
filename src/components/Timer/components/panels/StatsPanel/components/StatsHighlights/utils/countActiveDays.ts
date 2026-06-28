import type { StatsHeatmapCell } from '../../../StatsPanel.types'

/**
 * Number of days with at least one minute of focus in the heatmap window.
 */
export function countActiveDays(cells: StatsHeatmapCell[]): number {
  let n = 0
  for (const cell of cells) {
    if (!cell) continue
    if (Number.isFinite(cell.minutes) && cell.minutes > 0) n += 1
  }
  return n
}
