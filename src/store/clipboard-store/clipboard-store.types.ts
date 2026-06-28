import type { ClipboardLabel } from '@/store/clipboard-label-store'
import type { SensitivityLevel, SensitiveMatch } from '@/components/ClipboardManager/utils/sensitive-data/sensitiveData.types'
import type { SmartCollectionKey } from '@/components/ClipboardManager/utils/smart-collections/smartCollections.types'

export interface ClipboardItem {
  id: string
  contentType: 'text' | 'image'
  textContent: string | null
  imagePath: string | null
  thumbnailPath: string | null
  isPinned: boolean
  createdAt: string
  contentHash: string
  byteSize: number
  labels: ClipboardLabel[]
  imageDescription: string | null
  analysisStatus: 'none' | 'pending' | 'done' | 'failed'
  extractedText: string | null
  /**
   * Content analysis computed once by the Rust backend at capture time
   * (smart-collection categories, sensitivity level + match ranges).
   * Optional for backward-compatibility: when absent (e.g. a row captured
   * before this field existed), consumers fall back to client-side detection.
   */
  smartCategories?: SmartCollectionKey[]
  sensitivityLevel?: SensitivityLevel
  sensitivityMatches?: SensitiveMatch[]
}

export interface ClipboardStats {
  total: number
  textCount: number
  imageCount: number
  labeledCount: number
  pinnedCount: number
}

export type FilterType = 'all' | 'text' | 'image' | 'labeled' | 'pinned' | 'sensitive' | `label:${string}` | `smart:${string}`

export interface ClipboardState {
  items: ClipboardItem[]
  hasMore: boolean
  cursor: string | null
  offset: number
  isLoading: boolean
  isLoaded: boolean
  filter: FilterType
  searchQuery: string
  isFuzzySearch: boolean
  stats: ClipboardStats
  previewItemId: string | null
}

export interface ClipboardActions {
  loadItems: (reset?: boolean) => Promise<void>
  prependItem: (item: ClipboardItem) => void
  moveItemToTop: (item: ClipboardItem) => void
  removeItem: (id: string) => Promise<void>
  updateText: (id: string, textContent: string) => Promise<void>
  clearAll: () => Promise<void>
  copyToClipboard: (id: string) => Promise<void>
  togglePin: (id: string) => Promise<boolean>
  setFilter: (filter: FilterType) => void
  setSearchQuery: (query: string) => void
  toggleFuzzySearch: () => void
  loadStats: () => Promise<void>
  openPreview: (id: string) => void
  closePreview: () => void
  previewNext: () => void
  previewPrev: () => void
  addLabelToItem: (itemId: string, label: ClipboardLabel) => void
  removeLabelFromItem: (itemId: string, labelId: string) => void
  updateItemAnalysis: (itemId: string, description: string | null, status: ClipboardItem['analysisStatus'], extractedText?: string | null) => void
  updateImageDescription: (itemId: string, description: string) => Promise<void>
  reset: () => void
}

export type ClipboardStore = ClipboardState & ClipboardActions
export type ClipboardGet = () => ClipboardStore
export type ClipboardSet = (partial: Partial<ClipboardState>) => void
