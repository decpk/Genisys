import { useCallback, useEffect, useRef, useState } from 'react'

import type { StockSearchResult } from '@/store/stocks-tile-store'

import { searchStockSymbols } from '../api/searchStockSymbols'

import type { AddStockDialogProps, UseAddStockDialogDataResult } from './AddStockDialog.types'

const DEBOUNCE_MS = 250

interface Args {
  isOpen: AddStockDialogProps['isOpen']
  existingSymbols: AddStockDialogProps['existingSymbols']
  onAdd: AddStockDialogProps['onAdd']
  onClose: AddStockDialogProps['onClose']
}

/**
 * Powers `AddStockDialog`: debounced symbol search + keyboard nav.
 * Filters out any tickers already in the watchlist.
 */
export function useAddStockDialogData({
  isOpen,
  existingSymbols,
  onAdd,
  onClose,
}: Args): UseAddStockDialogDataResult {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<StockSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const reqIdRef = useRef(0)

  // Reset when dialog reopens
  useEffect(() => {
    if (!isOpen) return
    setQuery('')
    setResults([])
    setError(null)
    setSelectedIndex(0)
  }, [isOpen])

  // Debounced fetch
  useEffect(() => {
    if (!isOpen) return
    const trimmed = query.trim()
    if (trimmed.length < 1) {
      setResults([])
      setLoading(false)
      return
    }
    const myReq = ++reqIdRef.current
    setLoading(true)
    setError(null)
    const handle = setTimeout(() => {
      searchStockSymbols(trimmed)
        .then((items) => {
          if (myReq !== reqIdRef.current) return
          const existing = new Set(existingSymbols.map((s) => s.toUpperCase()))
          setResults(items.filter((it) => !existing.has(it.symbol.toUpperCase())))
          setSelectedIndex(0)
        })
        .catch((err: unknown) => {
          if (myReq !== reqIdRef.current) return
          setError(err instanceof Error ? err.message : 'Search failed')
        })
        .finally(() => {
          if (myReq === reqIdRef.current) setLoading(false)
        })
    }, DEBOUNCE_MS)
    return () => clearTimeout(handle)
  }, [query, isOpen, existingSymbols])

  const pickResult = useCallback(
    (r: StockSearchResult) => {
      onAdd({
        symbol: r.symbol.toUpperCase(),
        shortName: r.shortName ?? '',
        longName: r.longName ?? '',
        exchange: r.exchange ?? '',
        quoteType: r.quoteType ?? '',
      })
      onClose()
    },
    [onAdd, onClose],
  )

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    selectedIndex,
    setSelectedIndex,
    pickResult,
  }
}
