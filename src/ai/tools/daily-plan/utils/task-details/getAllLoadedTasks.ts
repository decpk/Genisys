import type { DPTask } from '@/components/DailyPlan/DailyPlan.types'

/** Flatten all currently loaded tasks in the store into a single array. */
export function getAllLoadedTasks(tasksByDate: Record<string, DPTask[]>): DPTask[] {
  return Object.values(tasksByDate).flat()
}
