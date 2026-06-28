import type { DPMeetingStatus } from '../../../../../DailyPlan.types'
import { MEETING_STATUS_PILL_STYLES } from '../MeetingCard.styles'

/** Pure: returns the pill className for a given meeting status. */
export function getMeetingStatusPillStyle(status: DPMeetingStatus): string {
  return MEETING_STATUS_PILL_STYLES[status]
}
