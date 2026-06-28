import type { ClipboardItem } from '@/store/clipboard-store'

export interface TimelineHourGroup {
  hour: number
  items: ClipboardItem[]
}
