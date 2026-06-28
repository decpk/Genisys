import { useMemo } from 'react'
import { useClipboardStore } from '@/store/clipboard-store'
import { filterBySmartCollection } from '../utils/smart-collections'
import type { SmartCollectionKey } from '../utils/smart-collections'
import { filterSensitiveItems } from '../utils/sensitive-data'

export function useClipboardContentData() {
  const items = useClipboardStore((s) => s.items)
  const filter = useClipboardStore((s) => s.filter)
  const isLoading = useClipboardStore((s) => s.isLoading)
  const isLoaded = useClipboardStore((s) => s.isLoaded)

  const displayCount = useMemo(() => {
    if (filter === 'sensitive') return filterSensitiveItems(items).length
    if (!filter.startsWith('smart:')) return items.length
    const collectionKey = filter.replace('smart:', '') as SmartCollectionKey
    return filterBySmartCollection(items, collectionKey).length
  }, [items, filter])

  const showEmptyState = isLoaded && displayCount === 0 && !isLoading

  return { showEmptyState }
}
