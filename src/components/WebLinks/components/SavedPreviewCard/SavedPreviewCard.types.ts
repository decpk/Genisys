import type { SavedPreview } from '@/components/WebLinks/WebLinks.types'

/** Props for a saved-preview card. */
export interface SavedPreviewCardProps {
  /** The saved preview to render. */
  preview: SavedPreview
}

/** View-model returned by `useSavedPreviewCardData`. */
export interface SavedPreviewCardViewModel {
  /** Whether the overflow actions menu is open. */
  menuOpen: boolean
  /** Controlled open-change handler for the overflow menu. */
  setMenuOpen: (open: boolean) => void
  /** Open the preview's URL in the default browser. */
  onOpen: () => void
  /** Re-fetch live metadata for the preview and update it in place. */
  onRefresh: () => void
  /** Whether a metadata refresh is currently in flight. */
  isRefreshing: boolean
  /** Confirm + delete the saved preview. */
  onDelete: () => void
}
