import type { StoreApi } from 'zustand'

import type { StocksTileStore, StockWatchItem } from '../../stocks-tile-store.types'

export function reorderItemsAction(
  set: StoreApi<StocksTileStore>['setState'],
  get: StoreApi<StocksTileStore>['getState'],
  ids: string[],
): void {
  const tile = get().tile
  if (!tile) return
  const byId = new Map(get().items.map((it) => [it.id, it]))
  const next: StockWatchItem[] = []
  for (let i = 0; i < ids.length; i++) {
    const found = byId.get(ids[i])
    if (found) next.push({ ...found, position: i })
  }
  set({ items: next })
  window.api?.saveStocksWatchlist(tile.id, next)
}
