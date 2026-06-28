import type { StoreApi } from 'zustand'

import type { StocksTileStore } from '../../stocks-tile-store.types'

export function tileExistsAction(
  _set: StoreApi<StocksTileStore>['setState'],
  get: StoreApi<StocksTileStore>['getState'],
): boolean {
  return Boolean(get().tile)
}
