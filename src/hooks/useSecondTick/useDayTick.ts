import { useSyncExternalStore } from 'react'

import { getSecondTick, subscribeSecondTick } from './secondTickState'

/** Stable no-op subscription used when a consumer opts out of ticking. */
function subscribeNever(): () => void {
  return () => {}
}

/**
 * Day-stable snapshot of the shared 1 Hz ticker: the wall-clock timestamp of the
 * current LOCAL day's midnight (00:00:00.000), derived from `getSecondTick()`.
 *
 * Because it truncates to midnight, the returned number is identical on every
 * tick within a day, so `useSyncExternalStore` (which compares snapshots with
 * `Object.is`) skips the re-render on all but the day-rollover tick.
 */
function getDayTickSnapshot(): number {
  const d = new Date(getSecondTick())
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/**
 * Subscribe to the shared ticker but only re-render when the LOCAL calendar day
 * changes — not every second. Returns the timestamp of the current day's
 * midnight. Reuses the single shared interval behind `useSecondTick` (no extra
 * timer) and pauses with it on window blur.
 *
 * Pass `enabled = false` (e.g. when the host app is hidden via
 * `useIsAppActive(...)`) to opt out: the component stops subscribing and no
 * longer keeps the shared interval alive. Derive day-scoped values purely from
 * the returned timestamp, e.g. `const day = useMemo(() => new Date(ts), [ts])`.
 */
export function useDayTick(enabled: boolean = true): number {
  const subscribe = enabled ? subscribeSecondTick : subscribeNever
  return useSyncExternalStore(subscribe, getDayTickSnapshot, getDayTickSnapshot)
}
