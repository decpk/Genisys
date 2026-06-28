import type { StoreApi } from 'zustand'

import { STOCKS_TILE_ID } from '../constants'
import type { StocksTileConfig, StocksTileStore } from '../../stocks-tile-store.types'

export function createTileAction(
  set: StoreApi<StocksTileStore>['setState'],
  get: StoreApi<StocksTileStore>['getState'],
): void {
  if (get().tile) return
  const now = new Date().toISOString()
  const tile: StocksTileConfig = {
    id: STOCKS_TILE_ID,
    tileWidth: 'half',
    refreshIntervalMs: 60_000,
    autoRefreshEnabled: true,
    lastRefreshedAt: null,
    createdAt: now,
    updatedAt: now,
  }
  set({ tile })
  window.api?.saveStocksTile(tile)
}
