import { useEffect, useMemo } from 'react'

import { useDailyPlanStore } from '@/store/daily-plan-store'
import type { DPTask } from '@/components/DailyPlan/DailyPlan.types'

import { getTodayStr } from '../utils/getTodayStr'
import { parseTimeToMinutes } from '../utils/parseTimeToMinutes'

export interface UseTodaysTasksResult {
  today: string
  tasks: DPTask[]
  completedCount: number
  totalCount: number
}

/**
 * Selects today's tasks from `useDailyPlanStore`, sorted by scheduled time
 * (untimed tasks last) then by `sortOrder`.
 *
 * Triggers a one-shot `loadDataForDate(today)` if today's data isn't loaded.
 */
export function useTodaysTasks(): UseTodaysTasksResult {
  const today = getTodayStr()
  const tasks = useDailyPlanStore((s) => s.tasks[today])
  const loadDataForDate = useDailyPlanStore((s) => s.loadDataForDate)

  useEffect(() => {
    if (tasks === undefined) {
      void loadDataForDate(today)
    }
  }, [tasks, today, loadDataForDate])

  return useMemo(() => {
    const list = tasks ?? []
    const sorted = [...list].sort((a, b) => {
      const aMin = parseTimeToMinutes(a.scheduledTime)
      const bMin = parseTimeToMinutes(b.scheduledTime)
      if (aMin != null && bMin != null) return aMin - bMin
      if (aMin != null) return -1
      if (bMin != null) return 1
      return a.sortOrder - b.sortOrder
    })
    const completedCount = sorted.filter((t) => t.status === 'completed').length
    return {
      today,
      tasks: sorted,
      completedCount,
      totalCount: sorted.length,
    }
  }, [today, tasks])
}
