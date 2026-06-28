import type { StockRange } from '@/store/stocks-tile-store'

/**
 * Format an X-axis tick label (epoch ms) appropriately for the selected range.
 *  - 1d        → "9:30 AM"
 *  - 7d / 14d  → "Mon 5"
 *  - 1m        → "May 5"
 *  - 1y / max  → "May 2025"
 */
export function formatChartTickByRange(epochMs: number, range: StockRange): string {
  const d = new Date(epochMs)
  switch (range) {
    case '1d':
      return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
    case '7d':
    case '14d':
      return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })
    case '1m':
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    case '1y':
    case 'max':
    default:
      return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
  }
}
