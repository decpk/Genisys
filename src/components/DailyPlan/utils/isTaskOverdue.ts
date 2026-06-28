import type { DPTask } from '../DailyPlan.types'

/**
 * A task is overdue when:
 * - status is NOT 'completed'
 * - has a scheduledTime
 * - scheduledDate is today or in the past
 * - current time >= task end time (scheduledTime + durationMinutes)
 */
export function isTaskOverdue(task: DPTask, now: Date): boolean {
  if (task.status === 'completed') return false
  if (!task.scheduledTime) return false

  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  if (task.scheduledDate > today) return false

  const [h, m] = task.scheduledTime.split(':').map(Number)
  const endMinutes = h * 60 + m + task.durationMinutes
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  return nowMinutes >= endMinutes
}
