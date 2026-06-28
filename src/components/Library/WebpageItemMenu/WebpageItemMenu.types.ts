import type { SavedWebpage } from '@/store/webpage-store'

export interface WebpageItemMenuProps {
  webpage: SavedWebpage
  onRename: () => void
  onEdit: () => void
  onRefresh: () => void
  onDelete: () => void
}
