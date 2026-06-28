import { useSecondTick } from '@/hooks/useSecondTick'

/**
 * Returns the number of milliseconds elapsed since `startedAt`, ticking once
 * per second. Returns `null` when `startedAt` is `null` (i.e. nothing is being
 * timed).
 *
 * Designed for compact live "Xm Ys" elapsed pills next to in-flight chapter /
 * book generation. The 1Hz update rate is fine for second-resolution display
 * and keeps re-renders cheap.
 *
 * Backed by the shared `useSecondTick` ticker (a single app-wide 1 Hz counter,
 * paused on window blur) instead of a per-instance `setInterval`. We opt out of
 * ticking entirely when nothing is being timed (`startedAt == null`) so idle
 * pills neither re-render nor keep the shared interval alive.
 */
export function useElapsedMs(startedAt: number | null | undefined): number | null {
  // The shared 1 Hz ticker returns the current wall-clock time in ms (paused on
  // blur). We subscribe only while timing; the returned timestamp keeps the
  // elapsed value current without calling `Date.now()` during render.
  const now = useSecondTick(startedAt != null)

  if (startedAt == null) return null
  return Math.max(0, now - startedAt)
}
