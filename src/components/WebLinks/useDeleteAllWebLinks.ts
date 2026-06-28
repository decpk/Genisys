import { useCallback } from 'react'

import { useWebLinksStore } from '@/store/weblinks-store'
import { useConfirmDialogStore } from '@/store/confirm-dialog-store'

/** View-model for the shared "Delete all" action. */
export interface DeleteAllWebLinksViewModel {
  /** Open the destructive confirm dialog that wipes every preview + folder. */
  onDeleteAll: () => void
  /** Whether there is anything to delete (at least one preview or folder). */
  canDeleteAll: boolean
}

/**
 * Shared handler for the "Delete all" action used by both the sidebar header and
 * the saved-previews toolbar. Routes the wipe through the app-wide confirm
 * dialog so the destructive action is always gated behind a confirmation.
 */
export function useDeleteAllWebLinks(): DeleteAllWebLinksViewModel {
  const previews = useWebLinksStore((state) => state.previews)
  const folders = useWebLinksStore((state) => state.folders)
  const clearAll = useWebLinksStore((state) => state.clearAll)
  const openConfirmDialog = useConfirmDialogStore((state) => state.openConfirmDialog)

  const canDeleteAll = previews.length > 0 || folders.length > 0

  const onDeleteAll = useCallback(() => {
    openConfirmDialog({
      title: 'Delete all web links?',
      description:
        'This permanently deletes every saved URL and folder. This action cannot be undone.',
      confirmLabel: 'Delete all',
      variant: 'destructive',
      onConfirm: () => clearAll(),
    })
  }, [openConfirmDialog, clearAll])

  return { onDeleteAll, canDeleteAll }
}
