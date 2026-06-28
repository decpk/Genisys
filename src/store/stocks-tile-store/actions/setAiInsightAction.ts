import type { StoreApi } from 'zustand'

import type { StockAIInsight, StocksTileStore } from '../../stocks-tile-store.types'

export function setAiInsightAction(
  set: StoreApi<StocksTileStore>['setState'],
  get: StoreApi<StocksTileStore>['getState'],
  itemId: string,
  insight: StockAIInsight | null,
): void {
  const next = { ...get().aiInsightByItem, [itemId]: insight }
  set({ aiInsightByItem: next })
}
