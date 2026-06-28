import type { DPMeeting } from '@/components/DailyPlan/DailyPlan.types'

export async function searchMeetings(query: string): Promise<DPMeeting[]> {
  const results = await window.api.dpSearchMeetings(query)
  return results || []
}
