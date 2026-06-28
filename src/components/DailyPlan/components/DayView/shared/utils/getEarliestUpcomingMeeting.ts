import type { DPMeeting } from '../../../../DailyPlan.types'

const TERMINAL_STATUSES: ReadonlyArray<DPMeeting['status']> = [
  'completed',
  'cancelled',
  'no_show',
]

/**
 * Returns the earliest non-terminal meeting from a list, sorted by `startTime`.
 *
 * Used by the Meetings section header to derive a "Next at HH:MM" subtitle.
 * Returns `null` when there are no meetings or all meetings are in a terminal
 * state (completed / cancelled / no_show).
 */
export function getEarliestUpcomingMeeting(meetings: DPMeeting[]): DPMeeting | null {
  if (meetings.length === 0) return null

  const candidates = meetings.filter((m) => !TERMINAL_STATUSES.includes(m.status))
  if (candidates.length === 0) return null

  let earliest = candidates[0]
  for (let i = 1; i < candidates.length; i += 1) {
    if (candidates[i].startTime < earliest.startTime) {
      earliest = candidates[i]
    }
  }
  return earliest
}
