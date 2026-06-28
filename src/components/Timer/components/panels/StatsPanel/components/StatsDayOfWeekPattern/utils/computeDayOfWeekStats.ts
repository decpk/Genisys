import type { StatsHeatmapCell } from '../../../StatsPanel.types'

export interface DayOfWeekStat {
  /** 0 = Sun, 1 = Mon, … 6 = Sat. Matches `Date.prototype.getDay()`. */
  dayIndex: number
  /** Two-letter abbreviation e.g. "Mo". */
  label: string
  /** Sum of minutes across all observed cells of this DOW. */
  totalMinutes: number
  /** Number of cells of this DOW present in the input. */
  sampleCount: number
  /** Average minutes per occurrence (round half-up). 0 when sampleCount is 0. */
  avgMinutes: number
}

const LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function parseDateKeyDayIndex(dateKey: string): number | null {
  // dateKey is YYYY-MM-DD; parse parts to avoid timezone drift.
  const parts = dateKey.split('-')
  if (parts.length !== 3) return null
  const y = Number(parts[0])
  const m = Number(parts[1])
  const d = Number(parts[2])
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) {
    return null
  }
  const date = new Date(y, m - 1, d)
  if (Number.isNaN(date.getTime())) return null
  return date.getDay()
}

/**
 * Buckets heatmap cells by day-of-week (Sun…Sat) and returns total + average
 * minutes per DOW. Cells with malformed date keys are skipped.
 */
export function computeDayOfWeekStats(
  cells: StatsHeatmapCell[],
): DayOfWeekStat[] {
  const totals = [0, 0, 0, 0, 0, 0, 0]
  const samples = [0, 0, 0, 0, 0, 0, 0]

  for (const cell of cells) {
    if (!cell || typeof cell.dateKey !== 'string') continue
    const dow = parseDateKeyDayIndex(cell.dateKey)
    if (dow === null) continue
    const minutes = Number.isFinite(cell.minutes) ? cell.minutes : 0
    totals[dow] += minutes
    samples[dow] += 1
  }

  return LABELS.map((label, dayIndex) => {
    const sampleCount = samples[dayIndex]
    const totalMinutes = totals[dayIndex]
    const avgMinutes = sampleCount > 0 ? Math.round(totalMinutes / sampleCount) : 0
    return { dayIndex, label, totalMinutes, sampleCount, avgMinutes }
  })
}
