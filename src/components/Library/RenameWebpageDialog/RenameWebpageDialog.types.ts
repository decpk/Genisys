import type { SavedWebpage } from '@/store/webpage-store'

export interface RenameWebpageDialogProps {
  webpage: SavedWebpage | null
  open: boolean
  onOpenChange: (open: boolean) => void
}
