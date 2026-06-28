import type {
  TimerGoals,
  TimerMilestone,
  TimerPerTaskTarget,
} from '@/store/timer-store/timer-store.types'

export interface GoalsPanelProps {}

export interface GoalsPanelData {
  goals: TimerGoals
  todaysFocusMinutes: number
  weeklyMinutes: number[]
  milestones: TimerMilestone[]
  streakDays: number
  updateGoals: (partial: Partial<TimerGoals>) => void
}

export type { TimerPerTaskTarget }
