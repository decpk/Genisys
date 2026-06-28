import type {
  StockHistoryPoint,
  StockNewsItem,
  StockQuote,
  StockRange,
  StockWatchItem,
} from '@/store/stocks-tile-store'

export interface StockDetailViewProps {
  item: StockWatchItem
  quote: StockQuote | undefined
  range: StockRange
  onRangeChange: (range: StockRange) => void
  historyByRange: Partial<Record<StockRange, StockHistoryPoint[]>>
  news: StockNewsItem[]
  loading: boolean
  onRefresh: () => void
}
