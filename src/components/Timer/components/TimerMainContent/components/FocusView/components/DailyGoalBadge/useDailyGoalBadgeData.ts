import { useTimerStore } from '@/store/timer-store'

export interface DailyGoalBadgeData {
  achievedMinutes: number
  targetMinutes: number
}

export function useDailyGoalBadgeData(): DailyGoalBadgeData {
  const achievedMinutes = useTimerStore((s) => s.todaysFocusMinutes)
  const targetMinutes = useTimerStore((s) => s.goals.dailyMinutesTarget)
  return { achievedMinutes, targetMinutes }
}
