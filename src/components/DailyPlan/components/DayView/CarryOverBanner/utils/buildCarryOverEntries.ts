import type { DPTask, DPReview, DPMeeting } from '@/components/DailyPlan/DailyPlan.types'
import type { CarryOverEntry } from '../CarryOverBanner.types'

export function buildCarryOverEntries(params: {
  tasks: DPTask[]
  reviews: DPReview[]
  meetings: DPMeeting[]
}): CarryOverEntry[] {
  const { tasks, reviews, meetings } = params
  const taskEntries: CarryOverEntry[] = tasks.map((data) => ({ type: 'task', data }))
  const reviewEntries: CarryOverEntry[] = reviews.map((data) => ({ type: 'review', data }))
  const meetingEntries: CarryOverEntry[] = meetings.map((data) => ({ type: 'meeting', data }))
  return [...taskEntries, ...reviewEntries, ...meetingEntries]
}
