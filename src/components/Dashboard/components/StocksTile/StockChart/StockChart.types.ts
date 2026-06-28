import type { StockHistoryPoint, StockRange } from '@/store/stocks-tile-store'

export interface StockChartProps {
  symbol: string
  points: StockHistoryPoint[]
  loading?: boolean
  height?: number
  changePercent: number | null
  currency?: string | null
  range: StockRange
}
