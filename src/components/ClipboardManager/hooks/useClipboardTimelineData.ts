import { useState, useEffect, useMemo, useCallback, useDeferredValue, startTransition } from 'react'
import type { ClipboardItem } from '@/store/clipboard-store'
import { useSettingsStore } from '@/store/settings-store'
import type { WorkSession } from '../utils/timeline-insights/sessions'
import { useTimelineAnalysisMap } from './useTimelineAnalysisMap'
import { useTimelineSessionsData } from './useTimelineSessionsData'
import { useTimelineDigestData } from './useTimelineDigestData'
import { useTimelineSecurityData } from './useTimelineSecurityData'
import { useTimelineCategoryData } from './useTimelineCategoryData'
import { useMultiDayClipboardData } from './useMultiDayClipboardData'
import { useTimelineHeatmapData } from './useTimelineHeatmapData'
import { useTimelineRecurringData } from './useTimelineRecurringData'

function getTodayDate(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function shiftDate(date: string, days: number): string {
  const d = new Date(date + 'T12:00:00')
  d.setDate(d.getDate() + days)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function useClipboardTimelineData() {
  const [date, setDateRaw] = useState(getTodayDate)
  const [items, setItems] = useState<ClipboardItem[]>([])
  const [loading, setLoading] = useState(false)

  const isToday = date === getTodayDate()

  const setDate = useCallback((d: string | ((prev: string) => string)) => {
    startTransition(() => { setDateRaw(d) })
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    window.api
      .loadClipboardItemsByDate(date)
      .then((result) => {
        if (!cancelled) {
          setItems(result.items ?? [])
        }
      })
      .catch(() => {
        if (!cancelled) {
          setItems([])
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [date])

  const deferredItems = useDeferredValue(items)

  const analysisMap = useTimelineAnalysisMap(deferredItems)
  const rawSessions = useTimelineSessionsData(deferredItems, analysisMap)
  const { digest, summary: digestSummary } = useTimelineDigestData(deferredItems, analysisMap, rawSessions)
  const securityAlerts = useTimelineSecurityData(deferredItems, analysisMap)
  const categoryBreakdowns = useTimelineCategoryData(rawSessions, analysisMap)

  const sortDirection = useSettingsStore((s) => s.clipboardTimelineSortDirection)
  const setSortDirection = useSettingsStore((s) => s.setClipboardTimelineSortDirection)

  // Apply timeline sort. Underlying detection always runs ascending so session/category logic stays
  // stable; we only flip the rendered order when the user prefers "recent first".
  const sessions = useMemo<WorkSession[]>(() => {
    if (sortDirection !== 'desc') return rawSessions
    return [...rawSessions].reverse().map((session) => ({
      ...session,
      items: [...session.items].reverse(),
    }))
  }, [rawSessions, sortDirection])

  // Heatmap and recurring sections are always visible \u2014 fetch the multi-day window unconditionally.
  const multiDay = useMultiDayClipboardData(true)
  const heatmap = useTimelineHeatmapData(multiDay.items)
  const recurringItems = useTimelineRecurringData(multiDay.items)

  const groupedByHour = useMemo(() => {
    const map = new Map<number, ClipboardItem[]>()
    for (const item of items) {
      const hour = new Date(item.createdAt).getHours()
      const existing = map.get(hour)
      if (existing) {
        existing.push(item)
      } else {
        map.set(hour, [item])
      }
    }
    return map
  }, [items])

  const goToPrevDay = useCallback(() => {
    setDate((d) => shiftDate(d, -1))
  }, [setDate])

  const goToNextDay = useCallback(() => {
    setDate((d) => shiftDate(d, 1))
  }, [setDate])

  const refresh = useCallback(() => {
    setLoading(true)
    window.api
      .loadClipboardItemsByDate(date)
      .then((result) => {
        setItems(result.items ?? [])
      })
      .catch(() => {
        setItems([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [date])

  return {
    date,
    items,
    loading,
    groupedByHour,
    setDate,
    goToPrevDay,
    goToNextDay,
    refresh,
    isToday,
    sessions,
    digest,
    digestSummary,
    securityAlerts,
    categoryBreakdowns,
    heatmap,
    recurringItems,
    multiDayLoading: multiDay.loading,
    sortDirection,
    setSortDirection,
  }
}
