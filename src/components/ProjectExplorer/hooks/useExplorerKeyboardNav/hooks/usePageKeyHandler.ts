import { useCallback } from 'react'
import type { RefObject } from 'react'
import type { Virtualizer } from '@tanstack/react-virtual'

import { clampIndex } from '../utils/clampIndex'
import { computePageStep } from '../utils/computePageStep'

interface UsePageKeyHandlerParams {
  itemCount: number
  columns: number
  activeIndex: number
  scrollRef: RefObject<HTMLDivElement | null>
  virtualizer: Virtualizer<HTMLDivElement, Element>
  navigateToIndex: (index: number) => void
}

/**
 * Returns a keydown handler for PageUp / PageDown — moves the active item by
 * roughly one visible viewport. Step is `visibleRowCount * columns`.
 */
export function usePageKeyHandler(params: UsePageKeyHandlerParams) {
  const { itemCount, columns, activeIndex, scrollRef, virtualizer, navigateToIndex } = params

  return useCallback(
    (event: KeyboardEvent): boolean => {
      if (event.key !== 'PageDown' && event.key !== 'PageUp') return false
      if (itemCount <= 0) return false

      const estimatedRowHeight = virtualizer.options.estimateSize(0)
      const visibleRows = computePageStep(scrollRef.current, estimatedRowHeight)
      const cols = columns < 1 ? 1 : columns
      const step = Math.max(1, visibleRows * cols)

      const base = activeIndex < 0 ? 0 : activeIndex
      const delta = event.key === 'PageDown' ? step : -step
      const next = clampIndex(base + delta, itemCount)
      navigateToIndex(next)
      return true
    },
    [itemCount, columns, activeIndex, scrollRef, virtualizer, navigateToIndex]
  )
}
