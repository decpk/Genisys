import { useTimerStore } from '@/store/timer-store'

import { computeWeeklyTotalMinutes } from '../../utils/computeWeeklyTotalMinutes'
import { computeProgressPct } from './utils/computeProgressPct'
import type { StatsGoalProgressViewModel } from './StatsGoalProgress.types'

/**
 * Reads daily / weekly minute targets and current totals from the timer
 * store and produces a flat view-model the dumb view consumes.
 *
 * Returns `hasGoals: false` when both targets are zero so the view can
 * early-return without rendering an empty card.
 */
export function useStatsGoalProgressData(): StatsGoalProgressViewModel {
  const dailyTarget = useTimerStore((s) => s.goals.dailyMinutesTarget)
  const weeklyTarget = useTimerStore((s) => s.goals.weeklyMinutesTarget)
  const todaysFocusMinutes = useTimerStore((s) => s.todaysFocusMinutes)
  const weeklyMinutes = useTimerStore((s) => s.weeklyMinutes)

  const weeklyCurrent = computeWeeklyTotalMinutes(weeklyMinutes)
  const dailyPct = computeProgressPct(todaysFocusMinutes, dailyTarget)
  const weeklyPct = computeProgressPct(weeklyCurrent, weeklyTarget)

  const hasGoals = dailyTarget > 0 || weeklyTarget > 0

  return {
    hasGoals,
    dailyTarget,
    dailyCurrent: todaysFocusMinutes,
    dailyPct,
    weeklyTarget,
    weeklyCurrent,
    weeklyPct,
  }
}
