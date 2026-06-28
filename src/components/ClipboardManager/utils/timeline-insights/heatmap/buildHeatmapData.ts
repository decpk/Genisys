import type { ClipboardItem } from '@/store/clipboard-store'
import type { HeatmapCell } from './heatmap.types'

export function buildHeatmapData(items: ClipboardItem[], days: number): HeatmapCell[] {
  if (items.length === 0) return []

  const cellMap = new Map<string, number>()

  for (const item of items) {
    const d = new Date(item.createdAt)
    const dateKey = formatDateKey(d)
    const hour = d.getHours()
    const key = `${dateKey}|${hour}`
    cellMap.set(key, (cellMap.get(key) ?? 0) + 1)
  }

  const cells: HeatmapCell[] = []

  const today = new Date()
  for (let dayOffset = days - 1; dayOffset >= 0; dayOffset--) {
    const d = new Date(today)
    d.setDate(d.getDate() - dayOffset)
    const dateKey = formatDateKey(d)

    for (let hour = 0; hour < 24; hour++) {
      const key = `${dateKey}|${hour}`
      cells.push({
        date: dateKey,
        hour,
        count: cellMap.get(key) ?? 0,
      })
    }
  }

  return cells
}

function formatDateKey(d: Date): string {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}
