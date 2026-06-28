import { useCallback } from 'react'

import type { RepoItem } from '../ProjectExplorer.types'

interface UseExplorerActivateItemParams {
  onOpenFolder: (path: string) => void
  onOpenFile: (path: string, objectId: string) => void
}

/**
 * Returns a stable callback that opens an item — dispatching to `onOpenFolder`
 * when the item is a folder, or `onOpenFile` when it is a file. Reused by all
 * view modes' keyboard nav so the Enter-key behaviour matches the click.
 */
export function useExplorerActivateItem(params: UseExplorerActivateItemParams) {
  const { onOpenFolder, onOpenFile } = params
  return useCallback(
    (item: RepoItem) => {
      if (item.isFolder) onOpenFolder(item.path)
      else onOpenFile(item.path, item.objectId)
    },
    [onOpenFolder, onOpenFile]
  )
}
