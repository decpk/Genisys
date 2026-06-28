import { useDailyPlanStore } from '@/store/daily-plan-store'
import type { DPTask } from '../../../../DailyPlan.types'
import { computeEndTime } from '../../../../utils/computeEndTime'
import { formatTimeRange } from '../../../../utils/formatTime'
import { computeDurationLabel } from '../../utils/computeDurationLabel'
import { computeTaskOverdue } from './utils/computeTaskOverdue'
import {
  getPriorityVisual,
  COMPLETED_PRIORITY_VISUAL,
} from '../../shared/priority'
import { STATUS_PILL_STYLES, STATUS_LABELS } from './TaskCard.styles'
import type { TaskCardDataState } from './TaskCard.types'

interface UseTaskCardDataArgs {
  task: DPTask
  onEdit: (task: DPTask) => void
}

export function useTaskCardData(args: UseTaskCardDataArgs): TaskCardDataState {
  const { task, onEdit } = args
  const toggleTaskComplete = useDailyPlanStore((s) => s.toggleTaskComplete)

  const isCompleted = task.status === 'completed'
  const hasTime = !!task.scheduledTime
  const endTime = hasTime ? computeEndTime(task.scheduledTime!, task.durationMinutes) : null
  const duration = hasTime
    ? computeDurationLabel(task.scheduledTime!, endTime!)
    : `${task.durationMinutes}m`

  const isOverdue = computeTaskOverdue(task, endTime)

  const statusLabel = STATUS_LABELS[task.status] ?? null
  const statusPillClass = STATUS_PILL_STYLES[task.status] ?? null

  // Completed tasks read as "archived" — drop to a muted slate dot so the row
  // no longer competes visually with active priorities.
  const priorityVisual = isCompleted
    ? COMPLETED_PRIORITY_VISUAL
    : getPriorityVisual(task.priority)

  const timeRangeText = hasTime && endTime ? formatTimeRange(task.scheduledTime!, endTime) : null

  function handleToggle() {
    toggleTaskComplete(task)
  }

  function handleDoubleClick() {
    onEdit(task)
  }

  return {
    isCompleted,
    hasTime,
    endTime,
    duration,
    isOverdue,
    statusLabel,
    statusPillClass,
    priorityVisual,
    timeRangeText,
    handleToggle,
    handleDoubleClick,
  }
}
