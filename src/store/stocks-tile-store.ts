import { create } from 'zustand'

import { addItemAction } from './stocks-tile-store/actions/addItemAction'
import { createTileAction } from './stocks-tile-store/actions/createTileAction'
import { loadAllAction } from './stocks-tile-store/actions/loadAllAction'
import { removeItemAction } from './stocks-tile-store/actions/removeItemAction'
import { removeTileAction } from './stocks-tile-store/actions/removeTileAction'
import { reorderItemsAction } from './stocks-tile-store/actions/reorderItemsAction'
import { setAiInsightAction } from './stocks-tile-store/actions/setAiInsightAction'
import { setAiInsightErrorAction } from './stocks-tile-store/actions/setAiInsightErrorAction'
import { setAiInsightLoadingAction } from './stocks-tile-store/actions/setAiInsightLoadingAction'
import { setAutoRefreshEnabledAction } from './stocks-tile-store/actions/setAutoRefreshEnabledAction'
import { setItemHistoryAction } from './stocks-tile-store/actions/setItemHistoryAction'
import { setItemLoadingAction } from './stocks-tile-store/actions/setItemLoadingAction'
import { setItemQuoteAction } from './stocks-tile-store/actions/setItemQuoteAction'
import { setNewsForItemAction } from './stocks-tile-store/actions/setNewsForItemAction'
import { setTileWidthAction } from './stocks-tile-store/actions/setTileWidthAction'
import { tileExistsAction } from './stocks-tile-store/actions/tileExistsAction'
import { updateItemAction } from './stocks-tile-store/actions/updateItemAction'
import type { StocksTileStore } from './stocks-tile-store.types'

export const useStocksTileStore = create<StocksTileStore>()((set, get) => ({
  // ── state ────────────────────────────────────────────────────────────
  tile: null,
  items: [],
  quoteBySymbol: {},
  historyBySymbol: {},
  newsByItem: {},
  loadingByItem: {},
  aiInsightByItem: {},
  aiInsightLoadingByItem: {},
  aiInsightErrorByItem: {},
  isLoaded: false,

  // ── actions (delegated, one per file) ────────────────────────────────
  loadAll: () => loadAllAction(set, get),
  createTile: () => createTileAction(set, get),
  removeTile: () => removeTileAction(set, get),
  addItem: (input) => addItemAction(set, get, input),
  updateItem: (id, patch) => updateItemAction(set, get, id, patch),
  removeItem: (id) => removeItemAction(set, get, id),
  reorderItems: (ids) => reorderItemsAction(set, get, ids),
  setTileWidth: (w) => setTileWidthAction(set, get, w),
  setItemLoading: (id, loading) => setItemLoadingAction(set, get, id, loading),
  setItemQuote: (sym, quote) => setItemQuoteAction(set, get, sym, quote),
  setItemHistory: (sym, range, points) =>
    setItemHistoryAction(set, get, sym, range, points),
  setNewsForItem: (id, items) => setNewsForItemAction(set, get, id, items),
  setAutoRefreshEnabled: (enabled) => setAutoRefreshEnabledAction(set, get, enabled),
  setAiInsight: (id, insight) => setAiInsightAction(set, get, id, insight),
  setAiInsightLoading: (id, loading) => setAiInsightLoadingAction(set, get, id, loading),
  setAiInsightError: (id, error) => setAiInsightErrorAction(set, get, id, error),
  tileExists: () => tileExistsAction(set, get),
}))

export { STOCKS_TILE_ID } from './stocks-tile-store/constants'
export type {
  AddStockInput,
  StockAIInsight,
  StockAIInsightConfidence,
  StockHistoryPoint,
  StockNewsItem,
  StockQuote,
  StockRange,
  StocksTileConfig,
  StockSearchResult,
  StockWatchItem,
  UpdateStockPatch,
} from './stocks-tile-store.types'
export { STOCK_RANGES } from './stocks-tile-store.types'
