interface GetAgendaSubtitleArgs {
  /** Count of meetings still upcoming today (filtered to visible). */
  upcomingMeetings: number
  /** Count of incomplete tasks for today. */
  remainingTasks: number
  /** Count of completed tasks for today. */
  completedTasks: number
  /** Total tasks for today (completed + remaining). */
  totalTasks: number
}

/**
 * Compose the small subtitle line under the "Today's Agenda" header.
 *
 * Examples:
 *   - 0 meetings, 0 tasks                       → "Nothing scheduled"
 *   - 0 meetings, 0 remaining, some completed   → "All caught up"
 *   - 2 meetings, 3 remaining                   → "2 upcoming · 3 pending"
 *   - 1 meeting, 0 remaining                    → "1 upcoming"
 *   - 0 meetings, 2 remaining                   → "2 pending"
 */
export function getAgendaSubtitle(args: GetAgendaSubtitleArgs): string {
  const { upcomingMeetings, remainingTasks, completedTasks, totalTasks } = args

  if (totalTasks === 0 && upcomingMeetings === 0) {
    return 'Nothing scheduled'
  }

  if (remainingTasks === 0 && upcomingMeetings === 0 && completedTasks > 0) {
    return 'All caught up'
  }

  const parts: string[] = []
  if (upcomingMeetings > 0) {
    parts.push(`${upcomingMeetings} upcoming`)
  }
  if (remainingTasks > 0) {
    parts.push(`${remainingTasks} pending`)
  }

  return parts.join(' · ')
}
