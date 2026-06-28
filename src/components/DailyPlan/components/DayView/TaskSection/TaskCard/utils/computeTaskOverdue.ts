import type { DPTask } from '../../../../../DailyPlan.types'
import { isToday } from '../../../../../utils/formatDate'

/**
 * Pure: returns true when the task is scheduled today, has an end time
 * in the past, and is not yet completed.
 */
export function computeTaskOverdue(task: DPTask, endTime: string | null): boolean {
  if (task.status === 'completed') return false
  if (!task.scheduledTime || !endTime) return false
  if (!isToday(task.scheduledDate)) return false

  const now = new Date()
  const [h, m] = endTime.split(':').map(Number)
  if (now.getHours() > h) return true
  if (now.getHours() === h && now.getMinutes() >= m) return true
  return false
}
