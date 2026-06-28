import type { StockRange } from '@/store/stocks-tile-store'

/**
 * Format a tooltip date label (epoch ms) appropriately for the selected range.
 *  - 1d                  → "May 1, 9:30 AM"
 *  - 7d / 14d / 1m       → "May 5, 10:30 AM"
 *  - 1y / max            → "May 5, 2025"
 */
export function formatChartTooltipDate(epochMs: number, range: StockRange): string {
  const d = new Date(epochMs)
  switch (range) {
    case '1d':
    case '7d':
    case '14d':
      return `${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}, ${d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`
    case '1m':
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    case '1y':
    case 'max':
    default:
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  }
}
