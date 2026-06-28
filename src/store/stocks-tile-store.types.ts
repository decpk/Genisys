// Frontend type declarations for the Stocks tile store.
// Mirror the Rust types in `src-tauri/src/types.rs` (camelCase via serde).

export type StockRange = '1d' | '7d' | '14d' | '1m' | '1y' | 'max'

export const STOCK_RANGES: StockRange[] = ['1d', '7d', '14d', '1m', '1y', 'max']

export interface StocksTileConfig {
  id: string
  tileWidth: string
  refreshIntervalMs: number
  autoRefreshEnabled: boolean
  lastRefreshedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface StockWatchItem {
  id: string
  tileId: string
  symbol: string
  shortName: string
  longName: string
  exchange: string
  quoteType: string
  customNewsUrl: string | null
  customPriceUrl: string | null
  alertAbove: number | null
  alertBelow: number | null
  alertEnabled: boolean
  position: number
  lastRefreshedAt: string | null
  createdAt: string
}

export interface StockQuote {
  symbol: string
  price: number
  prevClose: number
  changePct: number
  dayHigh: number | null
  dayLow: number | null
  dayOpen: number | null
  volume: number | null
  fiftyTwoWeekHigh: number | null
  fiftyTwoWeekLow: number | null
  currency: string
  marketState: string
  fetchedAt: string
}

export interface StockHistoryPoint {
  /** Unix epoch seconds. */
  t: number
  /** Close price. */
  c: number
}

export interface StockNewsItem {
  id: string
  watchlistId: string
  sourceType: 'yahoo' | 'ai' | 'url' | 'custom'
  title: string
  summary: string
  whyItMatters: string
  url: string
  publisher: string
  publishedAt: string | null
  fetchedAt: string
  rawHash: string
}

export interface StockSearchResult {
  symbol: string
  shortName: string
  longName: string
  exchange: string
  quoteType: string
}

export type StockAIInsightConfidence = 'low' | 'medium' | 'high'

/**
 * AI-generated stock analysis (a single rolling insight per watch item).
 * Built from the latest quote + recent news headlines. Strictly informational —
 * never a buy/sell recommendation.
 */
export interface StockAIInsight {
  /** One-line headline of what's happening. */
  summary: string
  /** Paragraph explaining the direction of the recent move (up/down/flat). */
  whyMoving: string
  /** Short forward outlook with caveats. */
  prediction: string
  /** Notable partnerships, catalysts, product launches, or sector tailwinds. */
  partnerships: string
  /** Risk factors / counter-arguments the user should keep in mind. */
  risks: string
  /** AI's confidence in its own analysis (low/medium/high). */
  confidence: StockAIInsightConfidence
  /** Snapshot of the quote at generation time, so users can see context shift. */
  priceAtGeneration: number
  changePctAtGeneration: number
  currency: string
  /** ISO 8601 timestamp of when the insight was generated. */
  generatedAt: string
  /** Underlying model used (e.g. gpt-4o). */
  model: string
}

export interface StocksTileState {
  tile: StocksTileConfig | null
  items: StockWatchItem[]
  quoteBySymbol: Record<string, StockQuote>
  historyBySymbol: Record<string, Partial<Record<StockRange, StockHistoryPoint[]>>>
  newsByItem: Record<string, StockNewsItem[]>
  loadingByItem: Record<string, boolean>
  /** AI-generated rolling insight per watch item id. Null when not yet generated. */
  aiInsightByItem: Record<string, StockAIInsight | null>
  /** Per-item loading flag for the AI insight generation only. */
  aiInsightLoadingByItem: Record<string, boolean>
  /** Per-item error message from the most recent AI insight attempt. */
  aiInsightErrorByItem: Record<string, string | null>
  isLoaded: boolean
}

export interface AddStockInput {
  symbol: string
  shortName?: string
  longName?: string
  exchange?: string
  quoteType?: string
  customNewsUrl?: string | null
  customPriceUrl?: string | null
  alertAbove?: number | null
  alertBelow?: number | null
  alertEnabled?: boolean
}

export type UpdateStockPatch = Partial<
  Pick<
    StockWatchItem,
    | 'customNewsUrl'
    | 'customPriceUrl'
    | 'alertAbove'
    | 'alertBelow'
    | 'alertEnabled'
    | 'shortName'
    | 'longName'
  >
>

export interface StocksTileActions {
  loadAll: () => Promise<void>
  createTile: () => void
  removeTile: () => void
  addItem: (input: AddStockInput) => string | null
  updateItem: (id: string, patch: UpdateStockPatch) => void
  removeItem: (id: string) => void
  reorderItems: (ids: string[]) => void
  setTileWidth: (width: string) => void
  setItemLoading: (id: string, loading: boolean) => void
  setItemQuote: (symbol: string, quote: StockQuote) => void
  setItemHistory: (symbol: string, range: StockRange, points: StockHistoryPoint[]) => void
  setNewsForItem: (itemId: string, items: StockNewsItem[]) => void
  setAutoRefreshEnabled: (enabled: boolean) => void
  /** Persist a freshly generated AI insight for an item. Pass `null` to clear. */
  setAiInsight: (itemId: string, insight: StockAIInsight | null) => void
  /** Flag toggled around an AI insight generation call. */
  setAiInsightLoading: (itemId: string, loading: boolean) => void
  /** Store the latest AI-insight error string for an item (or `null` to clear). */
  setAiInsightError: (itemId: string, error: string | null) => void
  tileExists: () => boolean
}

export type StocksTileStore = StocksTileState & StocksTileActions
