import { useEffect, useRef } from 'react'

import { useStocksTileStore } from '@/store/stocks-tile-store'

import { useStocksTileFetch } from './useStocksTileFetch'

/**
 * Orchestrator hook for the `StocksTile` shell.
 *
 * Runs a single bootstrap pass per `tile.id`:
 *  - fetches a quote + 1d history for every watch item
 *  - news is loaded by `loadAllAction` on store init, but is also
 *    refreshed lazily by the detail view via `useStocksTileFetch`
 */
export function useStocksTileData(): void {
  const tile = useStocksTileStore((s) => s.tile)
  const items = useStocksTileStore((s) => s.items)
  const { fetchQuoteFor, fetchHistoryFor } = useStocksTileFetch()
  const bootstrappedRef = useRef<string | null>(null)

  useEffect(() => {
    if (!tile) return
    if (bootstrappedRef.current === tile.id) return
    bootstrappedRef.current = tile.id

    for (const item of items) {
      fetchQuoteFor(item.symbol).catch(() => {})
      fetchHistoryFor(item.symbol, '1d').catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tile?.id])
}
