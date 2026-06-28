import type { ClipboardItem } from '@/store/clipboard-store'
import type { SmartCollectionKey, SmartCollectionCount } from './smartCollections.types'
import { detectCategories } from './detectCategories'
import { SMART_COLLECTION_ORDER } from './constants/smartCollectionConfig'

export function computeSmartCollectionCounts(items: ClipboardItem[]): SmartCollectionCount[] {
  const countMap: Record<SmartCollectionKey, number> = {
    url: 0,
    code: 0,
    color: 0,
    email: 0,
    json: 0,
    shell: 0,
    filepath: 0,
    phone: 0,
  }

  for (const item of items) {
    if (item.contentType !== 'text' || !item.textContent) continue
    const categories = item.smartCategories ?? detectCategories(item.textContent)
    for (const cat of categories) {
      countMap[cat]++
    }
  }

  return SMART_COLLECTION_ORDER
    .filter((key) => countMap[key] > 0)
    .map((key) => ({ key, count: countMap[key] }))
}
