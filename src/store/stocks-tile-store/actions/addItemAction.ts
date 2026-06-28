import type { StoreApi } from 'zustand'

import { generateWatchItemId } from '../constants'
import type {
  AddStockInput,
  StocksTileStore,
  StockWatchItem,
} from '../../stocks-tile-store.types'

/**
 * Add a new watch item to the tile. Returns the new item id, or `null` if
 * there is no tile yet or the symbol already exists.
 */
export function addItemAction(
  set: StoreApi<StocksTileStore>['setState'],
  get: StoreApi<StocksTileStore>['getState'],
  input: AddStockInput,
): string | null {
  const tile = get().tile
  if (!tile) return null
  const symbol = input.symbol.trim().toUpperCase()
  if (!symbol) return null
  const existing = get().items.find((it) => it.symbol === symbol)
  if (existing) return existing.id

  const id = generateWatchItemId()
  const now = new Date().toISOString()
  const newItem: StockWatchItem = {
    id,
    tileId: tile.id,
    symbol,
    shortName: input.shortName ?? symbol,
    longName: input.longName ?? '',
    exchange: input.exchange ?? '',
    quoteType: input.quoteType ?? 'EQUITY',
    customNewsUrl: input.customNewsUrl ?? null,
    customPriceUrl: input.customPriceUrl ?? null,
    alertAbove: input.alertAbove ?? null,
    alertBelow: input.alertBelow ?? null,
    alertEnabled: input.alertEnabled ?? false,
    position: get().items.length,
    lastRefreshedAt: null,
    createdAt: now,
  }
  const items = [...get().items, newItem]
  set({ items })
  window.api?.saveStocksWatchlist(tile.id, items)
  return id
}
