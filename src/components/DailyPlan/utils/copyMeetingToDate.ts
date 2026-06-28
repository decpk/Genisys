import type { DPMeeting } from '../DailyPlan.types'
import { generateId } from './generateId'

/** Pure builder: returns a NEW DPMeeting (fresh id/timestamps, reset status) scheduled on targetDate */
export function copyMeetingToDate(meeting: DPMeeting, targetDate: string): DPMeeting {
  const now = new Date().toISOString()
  return {
    ...meeting,
    id: generateId('mtg'),
    scheduledDate: targetDate,
    status: 'scheduled',
    createdAt: now,
    updatedAt: now,
  }
}
