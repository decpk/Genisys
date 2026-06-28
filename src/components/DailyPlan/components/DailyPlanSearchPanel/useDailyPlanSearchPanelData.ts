import { useState, useRef, useCallback, useMemo, useEffect } from 'react'

import { searchTasks } from './api/searchTasks'
import { searchMeetings } from './api/searchMeetings'
import { mergeAndSortResults } from './utils/mergeAndSortResults'
import { registerSearchFocusCallback } from './utils/searchFocusRegistry'

import type { DPSearchResultItem } from './DailyPlanSearchPanel.types'

const PAGE_SIZE = 20
const DEBOUNCE_MS = 300

export function useDailyPlanSearchPanelData() {
  const [query, setQuery] = useState('')
  const [allResults, setAllResults] = useState<DPSearchResultItem[]>([])
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const executeSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setAllResults([])
      setHasSearched(false)
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    setHasSearched(true)
    setVisibleCount(PAGE_SIZE)

    try {
      const [tasks, meetings] = await Promise.all([
        searchTasks(searchQuery),
        searchMeetings(searchQuery),
      ])
      const merged = mergeAndSortResults(tasks, meetings)
      setAllResults(merged)
    } catch (err) {
      console.error('Search failed:', err)
      setAllResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (!value.trim()) {
      setAllResults([])
      setHasSearched(false)
      setIsSearching(false)
      return
    }

    debounceRef.current = setTimeout(() => {
      executeSearch(value)
    }, DEBOUNCE_MS)
  }, [executeSearch])

  const clearSearch = useCallback(() => {
    setQuery('')
    setAllResults([])
    setHasSearched(false)
    setIsSearching(false)
    setVisibleCount(PAGE_SIZE)
    inputRef.current?.focus()
  }, [])

  const showMore = useCallback(() => {
    setIsLoadingMore(true)

    // Simulate a brief loading state for UX feedback
    setTimeout(() => {
      setVisibleCount((prev) => prev + PAGE_SIZE)
      setIsLoadingMore(false)
    }, 300)
  }, [])

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  useEffect(() => {
    registerSearchFocusCallback(() => {
      inputRef.current?.focus()
    })
    return () => registerSearchFocusCallback(null)
  }, [])

  const displayedResults = useMemo(
    () => allResults.slice(0, visibleCount),
    [allResults, visibleCount],
  )

  const hasMore = visibleCount < allResults.length
  const totalCount = allResults.length
  const hasQuery = query.length > 0
  const hasResults = allResults.length > 0
  const showEmptyState = hasSearched && !isSearching && !hasResults && hasQuery

  return {
    query,
    handleQueryChange,
    clearSearch,
    displayedResults,
    totalCount,
    hasMore,
    showMore,
    isSearching,
    isLoadingMore,
    hasQuery,
    hasResults,
    showEmptyState,
    inputRef,
  }
}
