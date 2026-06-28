import type { TimerInstance, TimerPhase } from '../timer-store.types'

/**
 * Computes the next phase for a timer instance whose current phase has
 * just completed. Pomodoro cycles work → short/long break → work, where
 * every Nth completed work session triggers a long break. Countdown and
 * stopwatch timers transition to `complete`.
 */
export function computeNextPhase(instance: TimerInstance): TimerPhase {
  const { mode, phase } = instance

  if (mode === 'pomodoro') {
    if (phase === 'work') {
      const nextCompleted = instance.completedSessionsInCycle + 1
      const isLong =
        instance.sessionsBeforeLongBreak > 0 &&
        nextCompleted % instance.sessionsBeforeLongBreak === 0
      return isLong ? 'long-break' : 'short-break'
    }
    if (phase === 'short-break' || phase === 'long-break') {
      return 'work'
    }
    if (phase === 'idle') return 'work'
    return 'work'
  }

  if (mode === 'countdown') return 'complete'
  // stopwatch
  return 'paused'
}
