import type { StockNewsItem } from '@/store/stocks-tile-store'

export async function fetchStockNews(symbol: string, count = 8): Promise<StockNewsItem[]> {
  const res = await window.api.fetchStockNews(symbol, count)
  if (!res.success) throw new Error(res.error ?? 'Failed to fetch news')
  return (res.items ?? []) as StockNewsItem[]
}
