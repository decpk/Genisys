import { useCallback } from 'react'

import { useStocksTileStore } from '@/store/stocks-tile-store'
import type { StockRange } from '@/store/stocks-tile-store'

import { fetchStockHistory as apiFetchHistory } from '../api/fetchStockHistory'
import { fetchStockNews as apiFetchNews } from '../api/fetchStockNews'
import { fetchStockQuote as apiFetchQuote } from '../api/fetchStockQuote'

interface FetchOptions {
  /** Bypass server-side cache. */
  force?: boolean
}

interface FetchAllOptions extends FetchOptions {
  /** When true, also fetches news for the symbol. Default `true`. */
  includeNews?: boolean
  /** Range for the chart fetch. Default `1d`. */
  range?: StockRange
}

/**
 * Centralised data fetcher for an individual watch item. Threads
 * loading state through the store so any consumer (header refresh,
 * detail view, auto-refresh) shares the same in-flight signal.
 */
export function useStocksTileFetch() {
  const setItemLoading = useStocksTileStore((s) => s.setItemLoading)
  const setItemQuote = useStocksTileStore((s) => s.setItemQuote)
  const setItemHistory = useStocksTileStore((s) => s.setItemHistory)
  const setNewsForItem = useStocksTileStore((s) => s.setNewsForItem)

  const fetchQuoteFor = useCallback(
    async (symbol: string, opts: FetchOptions = {}) => {
      const quote = await apiFetchQuote(symbol, opts.force ?? false)
      setItemQuote(symbol, quote)
      return quote
    },
    [setItemQuote],
  )

  const fetchHistoryFor = useCallback(
    async (symbol: string, range: StockRange, opts: FetchOptions = {}) => {
      const points = await apiFetchHistory(symbol, range, opts.force ?? false)
      setItemHistory(symbol, range, points)
      return points
    },
    [setItemHistory],
  )

  const fetchNewsFor = useCallback(
    async (itemId: string, symbol: string) => {
      const items = await apiFetchNews(symbol, 8)
      setNewsForItem(itemId, items)
      return items
    },
    [setNewsForItem],
  )

  const fetchAllFor = useCallback(
    async (itemId: string, symbol: string, opts: FetchAllOptions = {}) => {
      const { force = false, includeNews = true, range = '1d' as StockRange } = opts
      setItemLoading(itemId, true)
      try {
        const tasks: Promise<unknown>[] = [
          fetchQuoteFor(symbol, { force }),
          fetchHistoryFor(symbol, range, { force }),
        ]
        if (includeNews) tasks.push(fetchNewsFor(itemId, symbol))
        await Promise.all(tasks)
      } catch (err) {
        // Surface fetch errors through the loading flag only — the store
        // keeps previously cached values so the UI stays usable.
        // eslint-disable-next-line no-console
        console.warn('[StocksTile] fetchAllFor failed', symbol, err)
      } finally {
        setItemLoading(itemId, false)
      }
    },
    [fetchQuoteFor, fetchHistoryFor, fetchNewsFor, setItemLoading],
  )

  return { fetchQuoteFor, fetchHistoryFor, fetchNewsFor, fetchAllFor }
}
