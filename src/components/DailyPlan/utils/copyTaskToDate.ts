import type { DPTask } from '../DailyPlan.types'
import { generateId } from './generateId'

/** Pure builder: returns a NEW DPTask (fresh id/timestamps, reset status) scheduled on targetDate */
export function copyTaskToDate(task: DPTask, targetDate: string): DPTask {
  const now = new Date().toISOString()
  return {
    ...task,
    id: generateId('task'),
    scheduledDate: targetDate,
    status: 'todo',
    completedAt: null,
    createdAt: now,
    updatedAt: now,
  }
}
