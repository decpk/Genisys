import type { DPMeeting } from '../../../../DailyPlan.types'
import { formatTime } from '../../../../utils/formatTime'
import { getEarliestUpcomingMeeting } from './getEarliestUpcomingMeeting'

/**
 * Returns the micro-copy shown beneath the "Meetings" section title.
 *
 * Strategy:
 *  - No meetings              → "Nothing on the calendar"
 *  - At least one upcoming    → "Next at {HH:MM AM/PM}"
 *  - All meetings are wrapped → "All wrapped"
 */
export function getMeetingsSubtitle(meetings: DPMeeting[]): string {
  if (meetings.length === 0) return 'Nothing on the calendar'

  const next = getEarliestUpcomingMeeting(meetings)
  if (next === null) return 'All wrapped'

  return `Next at ${formatTime(next.startTime)}`
}
