import { useCallback } from 'react'
import type { Virtualizer } from '@tanstack/react-virtual'

import type { RepoItem } from '../../../ProjectExplorer.types'

interface UseNavigateToIndexParams {
  items: RepoItem[]
  columns: number
  virtualizer: Virtualizer<HTMLDivElement, Element>
  onActivePathChange: (path: string | null) => void
}

/**
 * Returns a stable callback that:
 *   1. Asks the virtualizer to scroll the item's row into view (ensuring the
 *      row mounts even if it was previously virtualized off-screen).
 *   2. Updates the lifted `activePath` state.
 *
 * The actual DOM focus call is performed by `useFocusActiveRow` once React
 * re-renders with the new active item.
 */
export function useNavigateToIndex(params: UseNavigateToIndexParams) {
  const { items, columns, virtualizer, onActivePathChange } = params

  return useCallback(
    (nextIndex: number) => {
      if (nextIndex < 0 || nextIndex >= items.length) return
      const cols = columns < 1 ? 1 : columns
      const rowIndex = Math.floor(nextIndex / cols)
      virtualizer.scrollToIndex(rowIndex, { align: 'auto' })
      onActivePathChange(items[nextIndex].path)
    },
    [items, columns, virtualizer, onActivePathChange]
  )
}
