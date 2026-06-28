import type { ContentWidth } from '@/store/settings-store'

export interface MessagesWidthPickerProps {
  contentWidth: ContentWidth
  onContentWidthChange: (width: ContentWidth) => void
}
