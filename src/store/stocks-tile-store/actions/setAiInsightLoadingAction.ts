import type { StoreApi } from 'zustand'

import type { StocksTileStore } from '../../stocks-tile-store.types'

export function setAiInsightLoadingAction(
  set: StoreApi<StocksTileStore>['setState'],
  get: StoreApi<StocksTileStore>['getState'],
  itemId: string,
  loading: boolean,
): void {
  const next = { ...get().aiInsightLoadingByItem, [itemId]: loading }
  set({ aiInsightLoadingByItem: next })
}
