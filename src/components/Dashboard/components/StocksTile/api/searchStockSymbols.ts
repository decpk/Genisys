import type { StockSearchResult } from '@/store/stocks-tile-store'

export async function searchStockSymbols(query: string): Promise<StockSearchResult[]> {
  const res = await window.api.searchStockSymbols(query)
  if (!res.success) throw new Error(res.error ?? 'Failed to search symbols')
  return (res.results ?? []) as StockSearchResult[]
}
