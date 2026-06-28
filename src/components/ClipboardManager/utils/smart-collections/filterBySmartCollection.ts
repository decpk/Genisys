import type { ClipboardItem } from '@/store/clipboard-store'
import type { SmartCollectionKey } from './smartCollections.types'
import { detectCategories } from './detectCategories'

export function filterBySmartCollection(
  items: ClipboardItem[],
  collectionKey: SmartCollectionKey
): ClipboardItem[] {
  return items.filter((item) => {
    if (item.contentType !== 'text' || !item.textContent) return false
    const categories = item.smartCategories ?? detectCategories(item.textContent)
    return categories.includes(collectionKey)
  })
}
