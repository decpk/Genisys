import type {
  StockQuote,
  StockRange,
  StockWatchItem,
  StockHistoryPoint,
} from '@/store/stocks-tile-store'

export interface StocksOverviewListProps {
  items: StockWatchItem[]
  quoteBySymbol: Record<string, StockQuote>
  historyBySymbol: Record<string, Partial<Record<StockRange, StockHistoryPoint[]>>>
  loadingByItem: Record<string, boolean>
  onSelectItem: (id: string) => void
}
