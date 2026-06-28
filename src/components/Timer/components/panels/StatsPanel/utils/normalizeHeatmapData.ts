import type { StatsHeatmapCell } from '../StatsPanel.types'

export interface NormalizedHeatmap {
  /** 7 rows × 30 cols (most recent day in last col, row 0 = Sunday). */
  cells: StatsHeatmapCell[][]
  maxMinutes: number
}

function getDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function normalizeHeatmapData(
  raw: StatsHeatmapCell[],
): NormalizedHeatmap {
  const lookup = new Map<string, number>()
  for (const c of raw) lookup.set(c.dateKey, c.minutes ?? 0)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const cols = 30
  const rows = 7
  const grid: StatsHeatmapCell[][] = Array.from({ length: rows }, () => [])
  let max = 0

  for (let col = 0; col < cols; col++) {
    const dayOffset = (cols - 1 - col)
    const date = new Date(today.getTime() - dayOffset * 86_400_000)
    const key = getDateKey(date)
    const minutes = lookup.get(key) ?? 0
    if (minutes > max) max = minutes
    const row = date.getDay()
    grid[row].push({ dateKey: key, minutes })
  }

  return { cells: grid, maxMinutes: max }
}
