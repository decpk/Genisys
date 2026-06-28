import type { StoreApi } from 'zustand'

import type { StockNewsItem, StocksTileStore } from '../../stocks-tile-store.types'

export function setNewsForItemAction(
  set: StoreApi<StocksTileStore>['setState'],
  get: StoreApi<StocksTileStore>['getState'],
  itemId: string,
  items: StockNewsItem[],
): void {
  const next = { ...get().newsByItem, [itemId]: items }
  set({ newsByItem: next })
  window.api?.saveStocksNews(itemId, items)
}
