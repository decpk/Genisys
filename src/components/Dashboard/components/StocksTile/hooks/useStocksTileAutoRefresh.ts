import { useEffect, useRef } from 'react'

import { useStocksTileStore } from '@/store/stocks-tile-store'

import { useStocksTileFetch } from './useStocksTileFetch'

const REFRESH_MS = 60_000

/**
 * Polls quote prices for every watch item every 60 s while the tab is
 * visible and `tile.autoRefreshEnabled` is true. History + news are not
 * touched (they have their own TTLs handled by the Rust cache).
 */
export function useStocksTileAutoRefresh(): void {
  const tile = useStocksTileStore((s) => s.tile)
  const items = useStocksTileStore((s) => s.items)
  const { fetchQuoteFor } = useStocksTileFetch()
  const itemsRef = useRef(items)
  itemsRef.current = items

  useEffect(() => {
    if (!tile?.autoRefreshEnabled) return
    let cancelled = false

    function tick(): void {
      if (cancelled) return
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return
      for (const item of itemsRef.current) {
        fetchQuoteFor(item.symbol, { force: false }).catch(() => {})
      }
    }

    const id = setInterval(tick, REFRESH_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [tile?.autoRefreshEnabled, fetchQuoteFor])
}
