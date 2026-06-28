import { useCallback } from 'react'

import { computeArrowIndex, type ArrowDirection } from '../utils/computeArrowIndex'

interface UseArrowKeyHandlerParams {
  itemCount: number
  columns: number
  activeIndex: number
  navigateToIndex: (index: number) => void
}

const KEY_TO_DIRECTION: Record<string, ArrowDirection> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right'
}

/**
 * Returns a keydown handler that consumes the four Arrow keys and moves the
 * active item by one step (1D) or one cell (2D, ArrowLeft/Right) or one row
 * (2D, ArrowUp/Down — delta = columns).
 *
 * For 1D views (columns === 1), ArrowLeft / ArrowRight are ignored so that
 * the active row can host focus on inputs/widgets without the explorer
 * stealing horizontal nav.
 */
export function useArrowKeyHandler(params: UseArrowKeyHandlerParams) {
  const { itemCount, columns, activeIndex, navigateToIndex } = params

  return useCallback(
    (event: KeyboardEvent): boolean => {
      const direction = KEY_TO_DIRECTION[event.key]
      if (!direction) return false

      const is2D = columns > 1
      const isHorizontal = direction === 'left' || direction === 'right'
      if (!is2D && isHorizontal) return false

      const nextIndex = computeArrowIndex({
        direction,
        currentIndex: activeIndex,
        itemCount,
        columns
      })
      if (nextIndex < 0) return false
      navigateToIndex(nextIndex)
      return true
    },
    [itemCount, columns, activeIndex, navigateToIndex]
  )
}
