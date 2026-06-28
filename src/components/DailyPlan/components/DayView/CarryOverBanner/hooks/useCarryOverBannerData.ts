import { useCallback, useState } from 'react'
import { getToday } from '@/components/DailyPlan/utils/formatDate'
import type { CarryOverBannerView } from '../CarryOverBanner.types'
import { useCarryOverItems } from './useCarryOverItems'
import { useCarryOverDismiss } from './useCarryOverDismiss'
import { useCarryOverActions } from './useCarryOverActions'

export function useCarryOverBannerData(): CarryOverBannerView {
  const today = getToday()
  const { entries, count, isTodayView } = useCarryOverItems()
  const { dismissed, dismiss } = useCarryOverDismiss(today)
  const { moveEntry, moveAllEntries, copyEntry, copyAllEntries } = useCarryOverActions(today)

  const [isExpanded, setIsExpanded] = useState(false)
  const toggleExpanded = useCallback(() => setIsExpanded((v) => !v), [])

  const visible = isTodayView && count > 0 && !dismissed

  const moveAll = useCallback(() => moveAllEntries(entries), [moveAllEntries, entries])
  const copyAll = useCallback(() => copyAllEntries(entries), [copyAllEntries, entries])

  return {
    visible,
    isExpanded,
    toggleExpanded,
    entries,
    count,
    moveEntry,
    moveAll,
    copyEntry,
    copyAll,
    dismiss,
  }
}
