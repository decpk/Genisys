import type { StockHistoryPoint, StockRange } from '@/store/stocks-tile-store'

export async function fetchStockHistory(
  symbol: string,
  range: StockRange,
  force = false,
): Promise<StockHistoryPoint[]> {
  const res = await window.api.fetchStockHistory(symbol, range, force)
  if (!res.success) throw new Error(res.error ?? 'Failed to fetch history')
  return (res.points ?? []) as StockHistoryPoint[]
}
