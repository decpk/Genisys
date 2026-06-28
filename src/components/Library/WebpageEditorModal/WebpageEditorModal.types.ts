import type { SavedWebpage } from '@/store/webpage-store'

export interface WebpageEditorModalProps {
  webpage: SavedWebpage | null
  open: boolean
  onOpenChange: (open: boolean) => void
}
