import type { StockRange } from '@/store/stocks-tile-store'

/**
 * Mirrors the Rust mapping in `range_to_interval.rs` — kept here only for
 * UI display purposes (e.g. tooltips, axis labels).
 */
export function rangeToInterval(range: StockRange): string {
  switch (range) {
    case '1d':
      return '5m'
    case '7d':
      return '30m'
    case '14d':
      return '1h'
    case '1m':
      return '1d'
    case '1y':
      return '1d'
    case 'max':
      return '1wk'
  }
}
