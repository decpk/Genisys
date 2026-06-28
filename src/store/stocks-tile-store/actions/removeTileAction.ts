import type { StoreApi } from 'zustand'

import type { StocksTileStore } from '../../stocks-tile-store.types'

export function removeTileAction(
  set: StoreApi<StocksTileStore>['setState'],
  _get: StoreApi<StocksTileStore>['getState'],
): void {
  set({
    tile: null,
    items: [],
    quoteBySymbol: {},
    historyBySymbol: {},
    newsByItem: {},
    loadingByItem: {},
  })
  window.api?.saveStocksTile(null)
}
