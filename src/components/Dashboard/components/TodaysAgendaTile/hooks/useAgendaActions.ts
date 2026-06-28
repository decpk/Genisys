import { useCallback } from 'react'

import { useDailyPlanStore } from '@/store/daily-plan-store'
import type { DPTask } from '@/components/DailyPlan/DailyPlan.types'

import { buildNewAgendaTask } from '../utils/buildNewAgendaTask'

export interface UseAgendaActionsResult {
  toggleTaskComplete: (task: DPTask) => Promise<void>
  addTask: (title: string) => Promise<void>
}

/**
 * Stable action wrappers for the Today's Agenda tile.
 */
export function useAgendaActions(): UseAgendaActionsResult {
  const toggleTaskComplete = useDailyPlanStore((s) => s.toggleTaskComplete)
  const saveTask = useDailyPlanStore((s) => s.saveTask)

  const handleToggle = useCallback(
    (task: DPTask) => toggleTaskComplete(task),
    [toggleTaskComplete]
  )

  const handleAdd = useCallback(
    (title: string) => {
      const trimmed = title.trim()
      if (!trimmed) return Promise.resolve()
      return saveTask(buildNewAgendaTask(trimmed))
    },
    [saveTask]
  )

  return { toggleTaskComplete: handleToggle, addTask: handleAdd }
}
