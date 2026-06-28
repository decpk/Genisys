import { useCallback } from 'react'

import type { RepoItem } from '../../../ProjectExplorer.types'

interface UseActivateKeyHandlerParams {
  items: RepoItem[]
  activeIndex: number
  onActivate: (item: RepoItem) => void
}

/**
 * Returns a keydown handler that opens the active item on Enter.
 *
 * Note: the row buttons themselves already handle Enter/Space when focused;
 * this hook covers the case where the active row isn't currently DOM-focused
 * (e.g. focus left the explorer but `activePath` is still set).
 */
export function useActivateKeyHandler(params: UseActivateKeyHandlerParams) {
  const { items, activeIndex, onActivate } = params

  return useCallback(
    (event: KeyboardEvent): boolean => {
      if (event.key !== 'Enter') return false
      if (activeIndex < 0 || activeIndex >= items.length) return false
      onActivate(items[activeIndex])
      return true
    },
    [items, activeIndex, onActivate]
  )
}
