import type { DayStats } from '../ProductivityAnalytics.types'

export function computeStreak(days: DayStats[]): { current: number; best: number } {
  let current = 0
  let best = 0
  let streak = 0

  const reversed = [...days].reverse()
  for (let i = 0; i < reversed.length; i++) {
    const d = reversed[i]
    if (d.totalTasks === 0) {
      if (i === 0) continue
      break
    }
    if (d.completedTasks === d.totalTasks) {
      streak++
    } else {
      break
    }
  }
  current = streak

  streak = 0
  for (const d of days) {
    if (d.totalTasks > 0 && d.completedTasks === d.totalTasks) {
      streak++
      best = Math.max(best, streak)
    } else if (d.totalTasks > 0) {
      streak = 0
    }
  }

  return { current, best }
}
