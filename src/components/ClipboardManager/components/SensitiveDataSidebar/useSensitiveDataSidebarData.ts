import { useMemo } from 'react'
import { useClipboardStore } from '@/store/clipboard-store'
import { countSensitiveItems } from '../../utils/sensitive-data'

export function useSensitiveDataSidebarData() {
  const items = useClipboardStore((s) => s.items)

  const sensitiveCount = useMemo(() => {
    return countSensitiveItems(items)
  }, [items])

  return { sensitiveCount }
}
