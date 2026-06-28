import type { TimerPerTaskTarget } from '../../GoalsPanel.types'

export interface PerTaskGoalsListProps {
  targets: TimerPerTaskTarget[]
  onChange: (next: TimerPerTaskTarget[]) => void
}
