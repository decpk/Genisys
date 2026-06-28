import { useCallback } from 'react'

interface UseGoUpKeyHandlerParams {
  onGoUp?: () => void
}

/**
 * Returns a keydown handler for Backspace — navigates one folder up via the
 * `onGoUp` callback. No-op when `onGoUp` is undefined (e.g. already at root).
 *
 * Modified Backspace (Cmd/Ctrl/Alt) is intentionally ignored so it can fall
 * through to file-operation shortcuts (e.g. Cmd+Backspace → Move to Trash).
 */
export function useGoUpKeyHandler(params: UseGoUpKeyHandlerParams) {
  const { onGoUp } = params

  return useCallback(
    (event: KeyboardEvent): boolean => {
      if (event.key !== 'Backspace') return false
      if (event.metaKey || event.ctrlKey || event.altKey) return false
      if (!onGoUp) return false
      onGoUp()
      return true
    },
    [onGoUp]
  )
}
