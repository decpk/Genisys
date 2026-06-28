import type { DPTask, DPMeeting } from '../DailyPlan.types'

function timeToMinutes(time24: string): number {
  const [h, m] = time24.split(':').map(Number)
  return h * 60 + m
}

/**
 * Checks if a task or meeting spans the current time.
 * Returns true if currentTime falls within [start, end).
 */
export function isEventCurrent(
  event: { type: 'task'; task: DPTask } | { type: 'meeting'; meeting: DPMeeting },
  currentTime: string,
): boolean {
  const nowMinutes = timeToMinutes(currentTime)

  if (event.type === 'task') {
    const task = event.task
    if (!task.scheduledTime) return false
    if (task.status === 'completed') return false
    const startMinutes = timeToMinutes(task.scheduledTime)
    const endMinutes = startMinutes + Math.max(task.durationMinutes, 15)
    return nowMinutes >= startMinutes && nowMinutes < endMinutes
  }

  const meeting = event.meeting
  if (meeting.status === 'cancelled' || meeting.status === 'no_show' || meeting.status === 'completed') return false
  const startMinutes = timeToMinutes(meeting.startTime)
  const endMinutes = timeToMinutes(meeting.endTime)
  return nowMinutes >= startMinutes && nowMinutes < endMinutes
}
