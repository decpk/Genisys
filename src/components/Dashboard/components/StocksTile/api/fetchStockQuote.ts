import type { StockQuote } from '@/store/stocks-tile-store'

export async function fetchStockQuote(symbol: string, force = false): Promise<StockQuote> {
  const res = await window.api.fetchStockQuote(symbol, force)
  if (!res.success || !res.quote) throw new Error(res.error ?? 'Failed to fetch quote')
  return res.quote as StockQuote
}
