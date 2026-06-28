import type { StatsHeatmapCell } from '../../../StatsPanel.types'

export interface BestHeatmapDay {
  /** ISO `YYYY-MM-DD`. */
  dateKey: string
  /** Minutes for that date. */
  minutes: number
}

/**
 * Returns the heatmap cell with the highest minute count, or `null` when
 * the input has no positive-minute cells.
 */
export function findBestHeatmapDay(
  cells: StatsHeatmapCell[],
): BestHeatmapDay | null {
  let best: BestHeatmapDay | null = null
  for (const cell of cells) {
    if (!cell || typeof cell.dateKey !== 'string') continue
    const minutes = Number.isFinite(cell.minutes) ? cell.minutes : 0
    if (minutes <= 0) continue
    if (!best || minutes > best.minutes) {
      best = { dateKey: cell.dateKey, minutes }
    }
  }
  return best
}
