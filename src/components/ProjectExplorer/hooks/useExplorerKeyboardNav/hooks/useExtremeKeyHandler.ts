import { useCallback } from 'react'

interface UseExtremeKeyHandlerParams {
  itemCount: number
  navigateToIndex: (index: number) => void
}

/**
 * Returns a keydown handler for Home / End — jump to the first / last item.
 * Cmd+Home / Cmd+End behave the same.
 */
export function useExtremeKeyHandler(params: UseExtremeKeyHandlerParams) {
  const { itemCount, navigateToIndex } = params

  return useCallback(
    (event: KeyboardEvent): boolean => {
      if (event.key !== 'Home' && event.key !== 'End') return false
      if (itemCount <= 0) return false
      const target = event.key === 'Home' ? 0 : itemCount - 1
      navigateToIndex(target)
      return true
    },
    [itemCount, navigateToIndex]
  )
}
