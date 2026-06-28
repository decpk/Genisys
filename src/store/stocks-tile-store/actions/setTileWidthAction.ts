import type { StoreApi } from 'zustand'

import type { StocksTileStore } from '../../stocks-tile-store.types'

export function setTileWidthAction(
  set: StoreApi<StocksTileStore>['setState'],
  get: StoreApi<StocksTileStore>['getState'],
  width: string,
): void {
  const tile = get().tile
  if (!tile || tile.tileWidth === width) return
  const next = { ...tile, tileWidth: width, updatedAt: new Date().toISOString() }
  set({ tile: next })
  window.api?.saveStocksTile(next)
}
