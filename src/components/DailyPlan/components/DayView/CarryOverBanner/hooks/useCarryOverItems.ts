import { useMemo } from 'react'
import { useDailyPlanStore } from '@/store/daily-plan-store'
import { getYesterday, isToday } from '@/components/DailyPlan/utils/formatDate'
import type { DPTask, DPReview, DPMeeting } from '@/components/DailyPlan/DailyPlan.types'
import type { CarryOverEntry } from '../CarryOverBanner.types'
import { getIncompleteTasks } from '../utils/getIncompleteTasks'
import { getIncompleteReviews } from '../utils/getIncompleteReviews'
import { getIncompleteMeetings } from '../utils/getIncompleteMeetings'
import { buildCarryOverEntries } from '../utils/buildCarryOverEntries'

const EMPTY_TASKS: DPTask[] = []
const EMPTY_REVIEWS: DPReview[] = []
const EMPTY_MEETINGS: DPMeeting[] = []

export function useCarryOverItems(): {
  entries: CarryOverEntry[]
  count: number
  isTodayView: boolean
} {
  const selectedDate = useDailyPlanStore((s) => s.selectedDate)
  const tasks = useDailyPlanStore((s) => s.tasks)
  const reviews = useDailyPlanStore((s) => s.reviews)
  const meetings = useDailyPlanStore((s) => s.meetings)

  const entries = useMemo(() => {
    const yesterday = getYesterday()
    const yesterdayTasks = tasks[yesterday] ?? EMPTY_TASKS
    const yesterdayReviews = reviews[yesterday] ?? EMPTY_REVIEWS
    const yesterdayMeetings = meetings[yesterday] ?? EMPTY_MEETINGS
    return buildCarryOverEntries({
      tasks: getIncompleteTasks(yesterdayTasks),
      reviews: getIncompleteReviews(yesterdayReviews),
      meetings: getIncompleteMeetings(yesterdayMeetings),
    })
  }, [tasks, reviews, meetings])

  const isTodayView = isToday(selectedDate)

  return { entries, count: entries.length, isTodayView }
}
