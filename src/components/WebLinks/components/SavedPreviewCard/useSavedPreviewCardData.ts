import { useCallback, useState } from 'react'

import { useWebLinksStore } from '@/store/weblinks-store'
import { useConfirmDialogStore } from '@/store/confirm-dialog-store'
import type { SavedPreview } from '@/components/WebLinks/WebLinks.types'

import type { SavedPreviewCardViewModel } from './SavedPreviewCard.types'
import { getCardTitle } from './utils/getCardTitle'

/**
 * Handlers for a saved-preview card: open in browser and delete (routed
 * through the app-wide confirm dialog).
 */
export function useSavedPreviewCardData(preview: SavedPreview): SavedPreviewCardViewModel {
  const openInBrowser = useWebLinksStore((state) => state.openInBrowser)
  const deletePreview = useWebLinksStore((state) => state.deletePreview)
  const refreshPreviewMetadata = useWebLinksStore((state) => state.refreshPreviewMetadata)
  const openConfirmDialog = useConfirmDialogStore((state) => state.openConfirmDialog)

  const [menuOpen, setMenuOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const onOpen = useCallback(() => {
    void openInBrowser(preview.finalUrl || preview.url)
  }, [openInBrowser, preview.finalUrl, preview.url])

  const onRefresh = useCallback(() => {
    setIsRefreshing(true)
    void refreshPreviewMetadata(preview.id)
      .catch((error: unknown) => {
        console.error('Failed to refresh preview metadata', error)
      })
      .finally(() => setIsRefreshing(false))
  }, [refreshPreviewMetadata, preview.id])

  const onDelete = useCallback(() => {
    openConfirmDialog({
      title: 'Delete preview',
      description: `Remove "${getCardTitle(preview)}" from your collection? This can't be undone.`,
      confirmLabel: 'Delete',
      variant: 'destructive',
      onConfirm: () => deletePreview(preview.id),
    })
  }, [openConfirmDialog, deletePreview, preview])

  return { menuOpen, setMenuOpen, onOpen, onRefresh, isRefreshing, onDelete }
}
