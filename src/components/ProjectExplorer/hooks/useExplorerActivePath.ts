import { useCallback, useState } from 'react'

import type { RepoItem } from '../ProjectExplorer.types'

interface UseExplorerActivePathParams {
  /** Current folder path (resets `activePath` when it changes). */
  currentPath: string
  /** Whether the pane is showing a single file (resets `activePath` on enter). */
  isViewingFile: boolean
  /** Items currently displayed (post search/filter). Used to clear stale paths. */
  items: RepoItem[]
}

interface ResetKey {
  currentPath: string
  isViewingFile: boolean
}

/**
 * Owns the lifted `activePath` state for the explorer pane.
 *
 * Behavior:
 *   - Resets when the user navigates to a new folder.
 *   - Resets when the pane switches to file-viewing mode.
 *   - Clears the active path if it is no longer present in the displayed items
 *     (e.g. after a search filter).
 *   - When no item is active and the folder has items, **defaults to selecting
 *     the first item** so keyboard navigation has an anchor and the user sees
 *     a visual highlight on entering a folder.
 *
 * Uses the React "store previous value during render" pattern to avoid
 * cascading renders from setState-in-effect.
 */
export function useExplorerActivePath(params: UseExplorerActivePathParams) {
  const { currentPath, isViewingFile, items } = params
  const [activePath, setActivePath] = useState<string | null>(null)
  const [resetKey, setResetKey] = useState<ResetKey>({ currentPath, isViewingFile })

  // Reset on folder navigation or when entering file viewer.
  if (resetKey.currentPath !== currentPath || resetKey.isViewingFile !== isViewingFile) {
    setResetKey({ currentPath, isViewingFile })
    setActivePath(null)
  }

  // Clear stale paths (e.g. after search filter removes the active item).
  if (activePath !== null && !items.some((item) => item.path === activePath)) {
    setActivePath(null)
  }

  // Default selection: first item in the folder, when not viewing a file.
  if (!isViewingFile && activePath === null && items.length > 0) {
    setActivePath(items[0].path)
  }

  const onActivePathChange = useCallback((next: string | null) => {
    setActivePath(next)
  }, [])

  return { activePath, onActivePathChange }
}
