import { useSyncExternalStore } from 'react'

import { getSecondTick, subscribeSecondTick } from './secondTickState'

/** Stable no-op subscription used when a consumer opts out of ticking. */
function subscribeNever(): () => void {
  return () => {}
}

/**
 * Subscribe to a single shared 1 Hz ticker. Returns the current wall-clock time
 * in milliseconds, refreshed once per second while the window is focused
 * (paused on blur). All consumers share ONE interval.
 *
 * Pass `enabled = false` (e.g. when the host app is hidden via
 * `useIsAppActive(...)`) to opt out: the component stops re-rendering on tick
 * and no longer keeps the shared interval alive. Derive your value purely from
 * the returned timestamp, e.g. `const now = useMemo(() => new Date(ts), [ts])`
 * or `ts - startedAt` — never call `Date.now()` during render.
 */
export function useSecondTick(enabled: boolean = true): number {
  const subscribe = enabled ? subscribeSecondTick : subscribeNever
  return useSyncExternalStore(subscribe, getSecondTick, getSecondTick)
}
