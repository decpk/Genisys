import type { DPMeeting } from '@/components/DailyPlan/DailyPlan.types'

export function getIncompleteMeetings(meetings: DPMeeting[]): DPMeeting[] {
  return meetings.filter((m) => m.status !== 'completed' && m.status !== 'cancelled')
}
