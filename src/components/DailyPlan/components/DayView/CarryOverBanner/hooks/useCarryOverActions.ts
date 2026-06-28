import { useCallback } from 'react'
import { useDailyPlanStore } from '@/store/daily-plan-store'
import { moveTaskToDate } from '@/components/DailyPlan/utils/moveTaskToDate'
import { moveReviewToDate } from '@/components/DailyPlan/utils/moveReviewToDate'
import { moveMeetingToDate } from '@/components/DailyPlan/utils/moveMeetingToDate'
import { copyTaskToDate } from '@/components/DailyPlan/utils/copyTaskToDate'
import { copyReviewToDate } from '@/components/DailyPlan/utils/copyReviewToDate'
import { copyMeetingToDate } from '@/components/DailyPlan/utils/copyMeetingToDate'
import type { CarryOverEntry } from '../CarryOverBanner.types'

export function useCarryOverActions(today: string): {
  moveEntry: (entry: CarryOverEntry) => void
  moveAllEntries: (entries: CarryOverEntry[]) => void
  copyEntry: (entry: CarryOverEntry) => void
  copyAllEntries: (entries: CarryOverEntry[]) => void
} {
  const saveTask = useDailyPlanStore((s) => s.saveTask)
  const saveReview = useDailyPlanStore((s) => s.saveReview)
  const saveMeeting = useDailyPlanStore((s) => s.saveMeeting)

  const moveEntry = useCallback(
    (entry: CarryOverEntry) => {
      if (entry.type === 'task') {
        saveTask(moveTaskToDate(entry.data, today))
      } else if (entry.type === 'review') {
        saveReview(moveReviewToDate(entry.data, today))
      } else if (entry.type === 'meeting') {
        saveMeeting(moveMeetingToDate(entry.data, today))
      }
    },
    [today, saveTask, saveReview, saveMeeting]
  )

  const moveAllEntries = useCallback(
    (entries: CarryOverEntry[]) => {
      entries.forEach((entry) => moveEntry(entry))
    },
    [moveEntry]
  )

  const copyEntry = useCallback(
    (entry: CarryOverEntry) => {
      if (entry.type === 'task') {
        saveTask(copyTaskToDate(entry.data, today))
      } else if (entry.type === 'review') {
        saveReview(copyReviewToDate(entry.data, today))
      } else if (entry.type === 'meeting') {
        saveMeeting(copyMeetingToDate(entry.data, today))
      }
    },
    [today, saveTask, saveReview, saveMeeting]
  )

  const copyAllEntries = useCallback(
    (entries: CarryOverEntry[]) => {
      entries.forEach((entry) => copyEntry(entry))
    },
    [copyEntry]
  )

  return { moveEntry, moveAllEntries, copyEntry, copyAllEntries }
}
