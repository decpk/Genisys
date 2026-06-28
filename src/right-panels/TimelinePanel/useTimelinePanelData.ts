import { useDailyPlanStore } from '@/store/daily-plan-store'
import type { DPTask, DPMeeting, DPReview } from '@/components/DailyPlan/DailyPlan.types'

const EMPTY_MEETINGS: DPMeeting[] = []

interface TimelinePanelData {
  tasks: DPTask[]
  meetings: DPMeeting[]
  reviews: DPReview[]
}

export function useTimelinePanelData(): TimelinePanelData {
  const selectedDate = useDailyPlanStore((s) => s.selectedDate)
  const allTasks = useDailyPlanStore((s) => s.tasks)
  const allMeetings = useDailyPlanStore((s) => s.meetings)
  const allReviews = useDailyPlanStore((s) => s.reviews)

  const tasks = allTasks[selectedDate] || []
  const meetings = allMeetings[selectedDate] || EMPTY_MEETINGS
  const reviews = allReviews[selectedDate] || []

  return { tasks, meetings, reviews }
}
