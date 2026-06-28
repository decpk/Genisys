import type { DPTask } from '../DailyPlan.types'

/** Pure builder: returns a new DPTask with scheduledDate set to targetDate and updatedAt refreshed */
export function moveTaskToDate(task: DPTask, targetDate: string): DPTask {
  return {
    ...task,
    scheduledDate: targetDate,
    updatedAt: new Date().toISOString(),
  }
}
