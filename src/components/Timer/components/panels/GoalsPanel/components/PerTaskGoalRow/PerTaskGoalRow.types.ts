import type { TimerPerTaskTarget } from '../../GoalsPanel.types'

export interface PerTaskGoalRowProps {
  target: TimerPerTaskTarget
  onChange: (next: TimerPerTaskTarget) => void
  onRemove: (taskId: string) => void
}
