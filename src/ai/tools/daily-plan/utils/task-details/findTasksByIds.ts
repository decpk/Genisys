import type { DPTask } from '@/components/DailyPlan/DailyPlan.types'

/** Resolve task ids to tasks while preserving requested id order. */
export function findTasksByIds(tasks: DPTask[], taskIds: string[]): DPTask[] {
  const taskById = new Map<string, DPTask>()

  for (const task of tasks) {
    taskById.set(task.id, task)
  }

  const resolvedTasks: DPTask[] = []
  for (const taskId of taskIds) {
    const task = taskById.get(taskId)
    if (task) {
      resolvedTasks.push(task)
    }
  }

  return resolvedTasks
}
