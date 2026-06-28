import type { ContentWidth } from '@/store/settings-store'

export interface NotesWidthPickerProps {
  contentWidth: ContentWidth
  onContentWidthChange: (width: ContentWidth) => void
  isCompact: boolean
}
