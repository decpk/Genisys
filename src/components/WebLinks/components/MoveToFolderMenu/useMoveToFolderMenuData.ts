import { useCallback } from 'react'

import { useWebLinksStore } from '@/store/weblinks-store'

import type { MoveToFolderMenuViewModel } from './MoveToFolderMenu.types'

/** Reads folders + the move action and binds them to a single preview id. */
export function useMoveToFolderMenuData(previewId: string): MoveToFolderMenuViewModel {
  const folders = useWebLinksStore((state) => state.folders)
  const movePreview = useWebLinksStore((state) => state.movePreview)

  const onMoveToUnfiled = useCallback(() => {
    void movePreview(previewId, null)
  }, [movePreview, previewId])

  const onMoveToFolder = useCallback(
    (folderId: string) => {
      void movePreview(previewId, folderId)
    },
    [movePreview, previewId],
  )

  return { folders, onMoveToUnfiled, onMoveToFolder }
}
