'use no memo'

import { useCallback, useEffect, useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'

import { useSearchPanelContextData } from './SearchPanel.context'

const ESTIMATED_ITEM_HEIGHT = 52

export function useSearchPanelData() {
  const { data, actions } = useSearchPanelContextData()
  const { searchQuery, currentMatchIndex, totalMatches, matches } = data
  const { setSearchQuery, navigateMatch, scrollToMatch, clearSearch, registerFocusCallback } = actions

  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: matches.length,
    getScrollElement: () => resultsRef.current,
    estimateSize: () => ESTIMATED_ITEM_HEIGHT,
    overscan: 10,
  })

  // Register focus callback so external Cmd+F can focus the input
  useEffect(() => {
    registerFocusCallback(() => {
      inputRef.current?.focus()
    })
    return () => registerFocusCallback(null)
  }, [registerFocusCallback])

  // Scroll active result into view in the virtualized list
  useEffect(() => {
    const activeIdx = currentMatchIndex - 1
    if (activeIdx >= 0 && activeIdx < matches.length) {
      virtualizer.scrollToIndex(activeIdx, { align: 'auto', behavior: 'smooth' })
    }
  }, [currentMatchIndex, matches.length, virtualizer])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        clearSearch()
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (e.shiftKey) navigateMatch('prev')
        else navigateMatch('next')
      }
    },
    [clearSearch, navigateMatch],
  )

  return {
    searchQuery,
    currentMatchIndex,
    totalMatches,
    matches,
    setSearchQuery,
    navigateMatch,
    scrollToMatch,
    clearSearch,
    inputRef,
    resultsRef,
    handleKeyDown,
    virtualizer,
  }
}
