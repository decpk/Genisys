import type { StoreApi } from 'zustand'

import type { StocksTileStore } from '../../stocks-tile-store.types'

export function removeItemAction(
  set: StoreApi<StocksTileStore>['setState'],
  get: StoreApi<StocksTileStore>['getState'],
  id: string,
): void {
  const tile = get().tile
  if (!tile) return
  const items = get()
    .items.filter((it) => it.id !== id)
    .map((it, idx) => ({ ...it, position: idx }))
  const newsByItem = { ...get().newsByItem }
  delete newsByItem[id]
  const loadingByItem = { ...get().loadingByItem }
  delete loadingByItem[id]
  set({ items, newsByItem, loadingByItem })
  window.api?.deleteStocksWatchItem(id)
  window.api?.saveStocksWatchlist(tile.id, items)
}
