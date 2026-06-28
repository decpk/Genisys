/** Builds the low-contrast summary line that sits below the agenda pills. */
export function buildSummaryLine(
  totalTasks: number,
  totalMeetings: number,
  dayPercent: number,
): string {
  const taskWord = totalTasks === 1 ? 'task' : 'tasks'
  const meetingWord = totalMeetings === 1 ? 'meeting' : 'meetings'
  return `${totalTasks} ${taskWord} · ${totalMeetings} ${meetingWord} · ${dayPercent}% of day elapsed`
}
