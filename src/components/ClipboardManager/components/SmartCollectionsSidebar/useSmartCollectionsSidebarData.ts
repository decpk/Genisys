import { useMemo } from 'react'
import { useClipboardStore } from '@/store/clipboard-store'
import {
  computeSmartCollectionCounts,
  SMART_COLLECTION_CONFIGS,
  SMART_COLLECTION_ICON_MAP,
} from '../../utils/smart-collections'
import type { SmartCollectionCount, SmartCollectionKey } from '../../utils/smart-collections'

export function useSmartCollectionsSidebarData() {
  const items = useClipboardStore((s) => s.items)

  const collections = useMemo<SmartCollectionCount[]>(() => {
    return computeSmartCollectionCounts(items)
  }, [items])

  const getConfig = (key: SmartCollectionKey) => SMART_COLLECTION_CONFIGS[key]
  const getIcon = (key: SmartCollectionKey) => {
    const config = SMART_COLLECTION_CONFIGS[key]
    return SMART_COLLECTION_ICON_MAP[config.icon as keyof typeof SMART_COLLECTION_ICON_MAP]
  }

  return {
    collections,
    getConfig,
    getIcon,
  }
}
