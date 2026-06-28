import type { StoreApi } from 'zustand'

import type { StocksTileStore } from '../../stocks-tile-store.types'

export function setItemLoadingAction(
  set: StoreApi<StocksTileStore>['setState'],
  get: StoreApi<StocksTileStore>['getState'],
  id: string,
  loading: boolean,
): void {
  const current = get().loadingByItem
  if (Boolean(current[id]) === loading) return
  const next = { ...current, [id]: loading }
  if (!loading) delete next[id]
  set({ loadingByItem: next })
}
