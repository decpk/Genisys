import type { ClipboardItem } from '@/store/clipboard-store'
import type { SmartCollectionKey } from '../../smart-collections'

export interface WorkSession {
  id: string
  startTime: string
  endTime: string
  items: ClipboardItem[]
  label: string
  icon: string
  dominantCategory: SmartCollectionKey | null
}
