import type { ClipboardTimelineSortDirection } from '@/store/settings-store'

export interface TimelineSortControlProps {
  value: ClipboardTimelineSortDirection
  onChange: (direction: ClipboardTimelineSortDirection) => void
}
