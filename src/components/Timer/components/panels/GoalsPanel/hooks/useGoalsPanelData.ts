import { useTimerStore } from '@/store/timer-store'

import type { GoalsPanelData } from '../GoalsPanel.types'

export function useGoalsPanelData(): GoalsPanelData {
  const goals = useTimerStore((s) => s.goals)
  const todaysFocusMinutes = useTimerStore((s) => s.todaysFocusMinutes)
  const weeklyMinutes = useTimerStore((s) => s.weeklyMinutes)
  const milestones = useTimerStore((s) => s.milestones)
  const streakDays = useTimerStore((s) => s.streakDays)
  const updateGoals = useTimerStore((s) => s.updateGoals)
  return {
    goals,
    todaysFocusMinutes,
    weeklyMinutes,
    milestones,
    streakDays,
    updateGoals,
  }
}
