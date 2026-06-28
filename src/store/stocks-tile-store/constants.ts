import type { StockHistoryPoint, StockNewsItem, StockWatchItem } from '../stocks-tile-store.types'

export const STOCKS_TILE_ID = '__stocks_tile__'

/** Module-level stable empty references — never return a fresh literal from a
 *  Zustand selector, or React 18's `useSyncExternalStore` will infinite-loop. */
export const EMPTY_WATCH_ITEMS: StockWatchItem[] = []
export const EMPTY_NEWS: StockNewsItem[] = []
export const EMPTY_HISTORY: StockHistoryPoint[] = []

export function generateWatchItemId(): string {
  return `stk-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function generateNewsItemId(): string {
  return `stk-news-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
