export type { ClipboardItem } from '@/store/clipboard-store'
export type { ClipboardLabel } from '@/store/clipboard-label-store'
export type { SmartCollectionKey } from './utils/smart-collections'

export type FilterType = 'all' | 'text' | 'image' | 'labeled' | 'pinned' | 'sensitive' | `label:${string}` | `smart:${string}`

export interface ClipboardStats {
  total: number
  textCount: number
  imageCount: number
  labeledCount: number
  pinnedCount: number
}
