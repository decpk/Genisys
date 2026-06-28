import { useEffect, useMemo } from 'react'

import { useDailyPlanStore } from '@/store/daily-plan-store'

import { getTodayKey } from '../utils/getTodayKey'
import { EYEBROW_LABEL, QUOTE_FALLBACK_BANK } from './ClockBriefingTop.constants'
import type { ClockBriefingTopData } from './ClockBriefingTop.types'
import { getDayOfYear } from './utils/getDayOfYear'

export function useClockBriefingTopData(
  now: Date,
  isVisible: boolean,
): ClockBriefingTopData {
  const todayKey = getTodayKey(now)

  const storedQuote = useDailyPlanStore(
    (s) => s.dailyEntries[todayKey]?.motivationalQuote,
  )
  const loadDataForDate = useDailyPlanStore((s) => s.loadDataForDate)

  useEffect(() => {
    if (!isVisible) return
    loadDataForDate(todayKey)
  }, [isVisible, todayKey, loadDataForDate])

  const quote = useMemo(() => {
    const trimmed = storedQuote?.trim()
    if (trimmed) {
      return trimmed
    }
    const idx = getDayOfYear(now) % QUOTE_FALLBACK_BANK.length
    return QUOTE_FALLBACK_BANK[idx]
  }, [storedQuote, now])

  return { quote, eyebrowLabel: EYEBROW_LABEL }
}
