import { getTodayKey } from '../timer-store.persistence'
import type { TimerStoreState } from '../timer-store.types'

export interface RollDailyCountersResult {
  changed: boolean
  patch: Partial<TimerStoreState>
}

/**
 * If the calendar day has changed since `state.todayKey`, shift the
 * weekly minutes array by the day delta, reset today's counters, and
 * return a partial state update. Otherwise returns `changed: false`.
 */
export function rollDailyCounters(
  state: TimerStoreState,
): RollDailyCountersResult {
  const today = getTodayKey()
  if (state.todayKey === today) {
    return { changed: false, patch: {} }
  }

  let dayDelta = 0
  if (state.todayKey) {
    const prev = new Date(state.todayKey)
    const now = new Date(today)
    if (!Number.isNaN(prev.getTime()) && !Number.isNaN(now.getTime())) {
      dayDelta = Math.max(0, Math.round((now.getTime() - prev.getTime()) / 86_400_000))
    }
  }

  const prior = state.weeklyMinutes ?? [0, 0, 0, 0, 0, 0, 0]
  const shifted: number[] = []
  for (let i = 0; i < 7; i++) {
    shifted.push(i < dayDelta ? 0 : prior[i - dayDelta] ?? 0)
  }
  if (dayDelta >= 1 && dayDelta <= 7) {
    shifted[dayDelta - 1] = state.todaysFocusMinutes
  }

  return {
    changed: true,
    patch: {
      todayKey: today,
      todaysCompletedSessions: 0,
      todaysFocusMinutes: 0,
      weeklyMinutes: shifted,
    },
  }
}
