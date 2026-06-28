import type { TimerStoreState } from '../timer-store.types'

interface Threshold {
  key: string
  test: (state: TimerStoreState, totalSessions: number, totalMinutes: number) => boolean
}

const THRESHOLDS: Threshold[] = [
  { key: 'first-session', test: (_s, total) => total >= 1 },
  { key: '50-sessions', test: (_s, total) => total >= 50 },
  { key: '100-sessions', test: (_s, total) => total >= 100 },
  { key: '10h-focus', test: (_s, _t, mins) => mins >= 600 },
  { key: '7-day-streak', test: (s) => s.streakDays >= 7 },
  { key: '30-day-streak', test: (s) => s.streakDays >= 30 },
  {
    key: 'daily-goal-met',
    test: (s) =>
      s.goals.dailyMinutesTarget > 0 &&
      s.todaysFocusMinutes >= s.goals.dailyMinutesTarget,
  },
  {
    key: 'weekly-goal-met',
    test: (s) => {
      if (s.goals.weeklyMinutesTarget <= 0) return false
      const weekTotal = s.weeklyMinutes.reduce((acc, n) => acc + (n ?? 0), 0)
      return weekTotal >= s.goals.weeklyMinutesTarget
    },
  },
]

/**
 * Returns the milestone keys that have just been newly achieved
 * relative to `state.milestones`. Caller is responsible for persisting
 * + appending to the store.
 */
export function checkMilestones(state: TimerStoreState): string[] {
  const earned = new Set(state.milestones.map((m) => m.key))
  const totalSessions = state.todaysCompletedSessions
  const totalMinutes = state.todaysFocusMinutes
  const newly: string[] = []
  for (const t of THRESHOLDS) {
    if (earned.has(t.key)) continue
    if (t.test(state, totalSessions, totalMinutes)) newly.push(t.key)
  }
  return newly
}
