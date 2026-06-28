import type { TimerSession } from '@/store/timer-store/timer-store.types'

import { toTimerDate } from './toTimerDate'

export interface HistoryStats {
  sessionsToday: number
  minutesToday: number
  sessionsTotal: number
  minutesTotal: number
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function computeHistoryStats(sessions: TimerSession[]): HistoryStats {
  const today = new Date()
  let sessionsToday = 0
  let minutesToday = 0
  let minutesTotal = 0
  for (const s of sessions) {
    const dur = s.durationSec ?? 0
    minutesTotal += dur
    const d = toTimerDate(s.completedAt as unknown as number | string)
    if (!Number.isNaN(d.getTime()) && isSameDay(d, today)) {
      sessionsToday += 1
      minutesToday += dur
    }
  }
  return {
    sessionsToday,
    minutesToday: Math.round(minutesToday / 60),
    sessionsTotal: sessions.length,
    minutesTotal: Math.round(minutesTotal / 60),
  }
}
