import type { StoreApi } from 'zustand'

import type {
  StockHistoryPoint,
  StockRange,
  StocksTileStore,
} from '../../stocks-tile-store.types'

export function setItemHistoryAction(
  set: StoreApi<StocksTileStore>['setState'],
  get: StoreApi<StocksTileStore>['getState'],
  symbol: string,
  range: StockRange,
  points: StockHistoryPoint[],
): void {
  const all = get().historyBySymbol
  const forSym = all[symbol] ?? {}
  const next = { ...all, [symbol]: { ...forSym, [range]: points } }
  set({ historyBySymbol: next })
}
