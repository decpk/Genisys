import type { StoreApi } from 'zustand'

import type {
  StocksTileStore,
  UpdateStockPatch,
} from '../../stocks-tile-store.types'

export function updateItemAction(
  set: StoreApi<StocksTileStore>['setState'],
  get: StoreApi<StocksTileStore>['getState'],
  id: string,
  patch: UpdateStockPatch,
): void {
  const tile = get().tile
  if (!tile) return
  const items = get().items.map((it) => (it.id === id ? { ...it, ...patch } : it))
  set({ items })
  window.api?.saveStocksWatchlist(tile.id, items)
}
