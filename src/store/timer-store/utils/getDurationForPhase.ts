import type { TimerInstance, TimerPhase } from '../timer-store.types'

/**
 * Returns the duration in seconds for the given phase on the supplied
 * instance. For pomodoro phases (`work`, `short-break`, `long-break`),
 * the instance carries the configured durations through `durationSec`
 * (work) and the parent settings — but each instance stores its own
 * authoritative `durationSec` for the work leg, so break durations are
 * derived per-call from the instance via convention:
 *   - work / running → `instance.durationSec`
 *   - short-break → 1/5 of work (or 5min default fallback)
 *   - long-break → 3/5 of work (or 15min default fallback)
 *
 * Callers that need exact configured break durations should supply them
 * via instance settings before invoking; this helper is the safe fallback
 * used when computing the next phase's countdown target.
 */
export function getDurationForPhase(
  instance: TimerInstance,
  phase: TimerPhase,
): number {
  if (phase === 'short-break') {
    return Math.max(60, Math.round(instance.durationSec / 5))
  }
  if (phase === 'long-break') {
    return Math.max(60, Math.round((instance.durationSec * 3) / 5))
  }
  // work / running / others use the instance's primary duration.
  return instance.durationSec
}
