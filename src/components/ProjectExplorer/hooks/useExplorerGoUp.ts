import { useCallback, useMemo } from 'react'

import { getParentPath } from './useExplorerKeyboardNav/utils/getParentPath'

interface UseExplorerGoUpParams {
  currentPath: string
  navigateToFolder: (path: string) => void
}

/**
 * Returns a memoised `goUp` callback (or undefined when at the root). Wraps
 * `navigateToFolder` with the parent-path computation so the keyboard nav hook
 * can fire-and-forget on Backspace.
 */
export function useExplorerGoUp(params: UseExplorerGoUpParams) {
  const { currentPath, navigateToFolder } = params

  const parent = useMemo(() => getParentPath(currentPath), [currentPath])

  const goUp = useCallback(() => {
    if (parent === null) return
    navigateToFolder(parent)
  }, [parent, navigateToFolder])

  return parent === null ? undefined : goUp
}
