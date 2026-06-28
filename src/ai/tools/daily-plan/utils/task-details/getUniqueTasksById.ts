import type { DPTask } from '@/components/DailyPlan/DailyPlan.types'

/** De-duplicate tasks by id while preserving first-seen order. */
export function getUniqueTasksById(tasks: DPTask[]): DPTask[] {
  const seen = new Set<string>()
  const uniqueTasks: DPTask[] = []

  for (const task of tasks) {
    if (!seen.has(task.id)) {
      seen.add(task.id)
      uniqueTasks.push(task)
    }
  }

  return uniqueTasks
}
