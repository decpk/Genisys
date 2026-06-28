import type { DPMeetingType } from '../../../../../DailyPlan.types'
import { MEETING_TYPE_LABELS } from '../../../../../constants/meetingTypeLabels'

/** Pure: returns the human-friendly label for a meeting type. */
export function getMeetingTypeLabel(meetingType: DPMeetingType): string {
  return MEETING_TYPE_LABELS[meetingType] ?? meetingType
}
