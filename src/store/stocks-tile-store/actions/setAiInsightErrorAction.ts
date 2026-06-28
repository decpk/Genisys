import type { StoreApi } from 'zustand'

import type { StocksTileStore } from '../../stocks-tile-store.types'

export function setAiInsightErrorAction(
  set: StoreApi<StocksTileStore>['setState'],
  get: StoreApi<StocksTileStore>['getState'],
  itemId: string,
  error: string | null,
): void {
  const next = { ...get().aiInsightErrorByItem, [itemId]: error }
  set({ aiInsightErrorByItem: next })
}
