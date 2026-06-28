import { useEffect, useRef } from 'react'

import type { StockRange } from '@/store/stocks-tile-store'

import { useStocksTileFetch } from '../hooks/useStocksTileFetch'

/**
 * Lazily fetches the chart series for the active range the first time
 * the user switches to it (other ranges hit the same store cache).
 */
export function useStockDetailViewData(symbol: string, range: StockRange, hasPoints: boolean): void {
  const { fetchHistoryFor } = useStocksTileFetch()
  const fetchedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const key = `${symbol}::${range}`
    if (fetchedRef.current.has(key)) return
    if (hasPoints) {
      fetchedRef.current.add(key)
      return
    }
    fetchedRef.current.add(key)
    fetchHistoryFor(symbol, range).catch(() => {})
  }, [symbol, range, hasPoints, fetchHistoryFor])
}
