import { useMemo } from 'react'
import type { ClipboardItem } from '@/store/clipboard-store'
import type { RecurringItem } from '../utils/timeline-insights/recurring'
import { detectRecurringContent } from '../utils/timeline-insights/recurring'

export function useTimelineRecurringData(items: ClipboardItem[]): RecurringItem[] {
  const recurring = useMemo(
    () => detectRecurringContent(items),
    [items]
  )

  return recurring
}
