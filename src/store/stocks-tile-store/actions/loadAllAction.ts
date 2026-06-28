import type { StoreApi } from 'zustand'

import type { StocksTileStore, StockWatchItem, StocksTileConfig, StockNewsItem } from '../../stocks-tile-store.types'

/**
 * Load tile + watchlist + cached news from SQLite on app start.
 * Quote/history caches are loaded lazily via the fetch hooks per-symbol.
 */
export async function loadAllAction(
  set: StoreApi<StocksTileStore>['setState'],
  _get: StoreApi<StocksTileStore>['getState'],
): Promise<void> {
  const api = window.api
  if (!api?.loadStocksTile) {
    set({ isLoaded: true })
    return
  }
  try {
    const tile = (await api.loadStocksTile()) as StocksTileConfig | null
    if (!tile) {
      set({ tile: null, items: [], newsByItem: {}, isLoaded: true })
      return
    }
    const items = ((await api.loadStocksWatchlist(tile.id)) ?? []) as StockWatchItem[]
    const newsByItem: Record<string, StockNewsItem[]> = {}
    for (const it of items) {
      try {
        const news = ((await api.loadStocksNews(it.id)) ?? []) as StockNewsItem[]
        if (news.length > 0) newsByItem[it.id] = news
      } catch {
        // ignore per-item news load errors — UI will fetch fresh on demand
      }
    }
    set({ tile, items, newsByItem, isLoaded: true })
  } catch (e) {
    console.error('[stocks-tile-store] loadAll failed:', e)
    set({ isLoaded: true })
  }
}
