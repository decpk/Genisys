import type { DPMeetingType } from '../DailyPlan.types'

export const MEETING_TYPE_LABELS: Record<DPMeetingType, string> = {
  general: 'General',
  one_on_one: '1:1',
  standup: 'Standup',
  review: 'Review',
  planning: 'Planning',
  retrospective: 'Retro',
  interview: 'Interview',
  client_call: 'Client',
  team: 'Team',
  workshop: 'Workshop',
}
