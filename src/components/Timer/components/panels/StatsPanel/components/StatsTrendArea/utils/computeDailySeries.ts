import type { StatsHeatmapCell } from '../../../StatsPanel.types'

export interface DailySeriesPoint {
  /** ISO `YYYY-MM-DD`. */
  dateKey: string
  /** Short label for x-axis tick (e.g. "Apr 12"). */
  label: string
  /** Minutes for the day; 0 when no data. */
  minutes: number
}

const DAY_MS = 86_400_000
const DEFAULT_DAYS = 30

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const SHORT_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

function toShortLabel(d: Date): string {
  return `${SHORT_MONTHS[d.getMonth()]} ${d.getDate()}`
}

/**
 * Builds a contiguous series of `days` points (default 30), oldest first,
 * filling missing days with 0 minutes. Robust against duplicate or
 * out-of-window cells.
 */
export function computeDailySeries(
  cells: StatsHeatmapCell[],
  days: number = DEFAULT_DAYS,
): DailySeriesPoint[] {
  const lookup = new Map<string, number>()
  for (const c of cells) {
    if (!c || typeof c.dateKey !== 'string') continue
    const minutes = Number.isFinite(c.minutes) ? c.minutes : 0
    lookup.set(c.dateKey, minutes)
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const out: DailySeriesPoint[] = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today.getTime() - i * DAY_MS)
    const dateKey = toDateKey(date)
    out.push({
      dateKey,
      label: toShortLabel(date),
      minutes: lookup.get(dateKey) ?? 0,
    })
  }
  return out
}
