import type { DPTask } from '@/components/DailyPlan/DailyPlan.types'

export function getIncompleteTasks(tasks: DPTask[]): DPTask[] {
  return tasks.filter((task) => task.status !== 'completed')
}
