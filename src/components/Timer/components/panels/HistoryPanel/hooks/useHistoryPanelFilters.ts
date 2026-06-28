import { useState } from 'react'

import type { HistoryFilter } from '../HistoryPanel.types'

const PAGE_SIZE = 25

export interface HistoryFiltersHook {
  filter: HistoryFilter
  limit: number
  offset: number
  setSearch: (value: string) => void
  setTagId: (value: string | null) => void
  setRange: (from: number | null, to: number | null) => void
  loadMore: () => void
  reset: () => void
}

export function useHistoryPanelFilters(): HistoryFiltersHook {
  const [search, setSearchState] = useState('')
  const [tagId, setTagIdState] = useState<string | null>(null)
  const [fromTs, setFromTs] = useState<number | null>(null)
  const [toTs, setToTs] = useState<number | null>(null)
  const [offset, setOffset] = useState(0)

  const filter: HistoryFilter = { search, tagId, fromTs, toTs }

  const setSearch = (value: string) => {
    setSearchState(value)
    setOffset(0)
  }

  const setTagId = (value: string | null) => {
    setTagIdState(value)
    setOffset(0)
  }

  const setRange = (from: number | null, to: number | null) => {
    setFromTs(from)
    setToTs(to)
    setOffset(0)
  }

  const loadMore = () => setOffset((o) => o + PAGE_SIZE)

  const reset = () => {
    setSearchState('')
    setTagIdState(null)
    setFromTs(null)
    setToTs(null)
    setOffset(0)
  }

  return {
    filter,
    limit: PAGE_SIZE,
    offset,
    setSearch,
    setTagId,
    setRange,
    loadMore,
    reset,
  }
}
