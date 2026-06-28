import type { DPTask } from '../../../../DailyPlan.types'

export interface WeekTaskMiniCardProps {
  task: DPTask
  day: string
  onToggle: (taskId: string, day: string) => void
}
