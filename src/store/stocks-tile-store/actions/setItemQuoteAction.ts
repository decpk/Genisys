import type { StoreApi } from 'zustand'

import type { StockQuote, StocksTileStore } from '../../stocks-tile-store.types'

export function setItemQuoteAction(
  set: StoreApi<StocksTileStore>['setState'],
  get: StoreApi<StocksTileStore>['getState'],
  symbol: string,
  quote: StockQuote,
): void {
  const next = { ...get().quoteBySymbol, [symbol]: quote }
  set({ quoteBySymbol: next })
}
