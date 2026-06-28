import type { ClipboardItem } from '@/store/clipboard-store'
import type { FilterType } from '@/store/clipboard-store/clipboard-store.types'
import type { SmartCollectionKey } from './smart-collections'
import { filterBySmartCollection } from './smart-collections'
import { filterSensitiveItems } from './sensitive-data'

export function getFilteredItems(items: ClipboardItem[], filter: FilterType): ClipboardItem[] {
  if (filter === 'sensitive') return filterSensitiveItems(items)
  if (!filter.startsWith('smart:')) return items
  const collectionKey = filter.replace('smart:', '') as SmartCollectionKey
  return filterBySmartCollection(items, collectionKey)
}
