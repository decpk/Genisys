import type { DPTask } from '../../../../DailyPlan.types'
import type { PriorityVisual } from '../../shared/priority'

export interface TaskCardProps {
  task: DPTask
  onEdit: (task: DPTask) => void
}

export interface TaskCardDataState {
  isCompleted: boolean
  hasTime: boolean
  endTime: string | null
  duration: string
  isOverdue: boolean
  statusLabel: string | null
  statusPillClass: string | null
  priorityVisual: PriorityVisual
  timeRangeText: string | null
  handleToggle: () => void
  handleDoubleClick: () => void
}
