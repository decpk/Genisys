import type { StockNewsItem } from '@/store/stocks-tile-store'

export interface StockNewsDetailProps {
  item: StockNewsItem
  onBack: () => void
}
