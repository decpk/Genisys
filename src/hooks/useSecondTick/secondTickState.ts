import { isWindowFocused, subscribeWindowFocus } from '@/hooks/useWindowFocus'

/**
 * Shared 1 Hz ticker state.
 *
 * A SINGLE module-level interval drives every consumer of `useSecondTick`,
 * replacing the many per-component `setInterval(…, 1000)` clocks. The exposed
 * value is the current wall-clock time in milliseconds, refreshed once per
 * second — consumers derive `new Date(ts)` (pure) or `ts - startedAt` from it
 * instead of calling `Date.now()` during render.
 *
 * The interval only runs while at least one component is subscribed AND the
 * window is focused — it is created lazily on first subscribe and paused on
 * blur, so a background/blurred window does zero clock work.
 */

let value = Date.now()
const listeners = new Set<() => void>()
let intervalId: ReturnType<typeof setInterval> | null = null
let focusUnsub: (() => void) | null = null

function emit(): void {
  for (const listener of listeners) listener()
}

function startInterval(): void {
  if (intervalId !== null) return
  value = Date.now() // snap on (re)start so consumers are immediately current
  intervalId = setInterval(() => {
    value = Date.now()
    emit()
  }, 1000)
}

function stopInterval(): void {
  if (intervalId === null) return
  clearInterval(intervalId)
  intervalId = null
}

function handleFocusChange(): void {
  if (listeners.size === 0) return
  if (isWindowFocused()) {
    startInterval() // snaps `value` and resumes
    emit()
  } else {
    stopInterval()
  }
}

/**
 * Subscribe to the shared 1 Hz tick. Lazily starts the interval on the first
 * subscriber (if focused) and wires focus pause/resume; tears everything down
 * when the last subscriber leaves.
 */
export function subscribeSecondTick(listener: () => void): () => void {
  listeners.add(listener)
  if (listeners.size === 1) {
    focusUnsub = subscribeWindowFocus(handleFocusChange)
    if (isWindowFocused()) startInterval()
  }
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) {
      stopInterval()
      focusUnsub?.()
      focusUnsub = null
    }
  }
}

/** Current wall-clock time in ms — refreshed once per second while focused. */
export function getSecondTick(): number {
  return value
}
