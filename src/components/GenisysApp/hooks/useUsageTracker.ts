import { useUsageFocusSync } from './useUsageFocusSync'
import { useUsageMidnightFlush } from './useUsageMidnightFlush'

/**
 * Always-on shell hook that drives the app-usage tracker. Usage tracking is
 * always on (no user opt-out). Composes two focused sub-hooks:
 *  - {@link useUsageFocusSync} — pauses/resumes the foreground segment.
 *  - {@link useUsageMidnightFlush} — midnight rollover + unload flush.
 *
 * Mount once at the app shell (next to `useTimerTick`).
 */
export function useUsageTracker(): void {
  useUsageFocusSync()
  useUsageMidnightFlush()
}
