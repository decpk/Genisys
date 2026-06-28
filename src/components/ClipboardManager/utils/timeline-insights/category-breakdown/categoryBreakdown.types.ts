import type { SmartCollectionKey } from '../../smart-collections'

export interface CategoryBreakdown {
  categories: CategoryCount[]
  imageCount: number
  total: number
}

export interface CategoryCount {
  key: SmartCollectionKey
  count: number
}
