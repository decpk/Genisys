import type { StoreApi } from 'zustand'

import type { StocksTileStore } from '../../stocks-tile-store.types'

export function setAutoRefreshEnabledAction(
  set: StoreApi<StocksTileStore>['setState'],
  get: StoreApi<StocksTileStore>['getState'],
  enabled: boolean,
): void {
  const tile = get().tile
  if (!tile || tile.autoRefreshEnabled === enabled) return
  const next = {
    ...tile,
    autoRefreshEnabled: enabled,
    updatedAt: new Date().toISOString(),
  }
  set({ tile: next })
  window.api?.saveStocksTile(next)
}
