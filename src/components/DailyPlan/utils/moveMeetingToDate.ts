import type { DPMeeting } from '../DailyPlan.types'

/** Pure builder: returns a new DPMeeting with scheduledDate set to targetDate and updatedAt refreshed */
export function moveMeetingToDate(meeting: DPMeeting, targetDate: string): DPMeeting {
  return {
    ...meeting,
    scheduledDate: targetDate,
    updatedAt: new Date().toISOString(),
  }
}
