import { useSyncExternalStore } from 'react'

export interface WindowSize {
  width: number
  height: number
}

function getInitialSize(): WindowSize {
  if (typeof window === 'undefined') return { width: 0, height: 0 }
  return { width: window.innerWidth, height: window.innerHeight }
}

let snapshot: WindowSize = getInitialSize()
const listeners = new Set<() => void>()
let initialized = false
let detachListeners: (() => void) | null = null

function emit(): void {
  if (typeof window === 'undefined') return
  const next: WindowSize = { width: window.innerWidth, height: window.innerHeight }
  if (next.width === snapshot.width && next.height === snapshot.height) return
  snapshot = next
  listeners.forEach((cb) => cb())
}

function subscribe(cb: () => void): () => void {
  if (!initialized && typeof window !== 'undefined') {
    initialized = true
    snapshot = { width: window.innerWidth, height: window.innerHeight }
    window.addEventListener('resize', emit)
    window.addEventListener('orientationchange', emit)
    detachListeners = () => {
      window.removeEventListener('resize', emit)
      window.removeEventListener('orientationchange', emit)
    }
  }
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

function getSnapshot(): WindowSize {
  return snapshot
}

function getServerSnapshot(): WindowSize {
  return { width: 0, height: 0 }
}

// HMR teardown: remove the singleton window listeners on dev reload so
// they don't accumulate across module reloads. Production behavior is
// unchanged (listeners stay attached for app lifetime by design).
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    detachListeners?.()
    detachListeners = null
    initialized = false
  })
}

/**
 * Subscribes to the browser viewport size and re-renders the consumer
 * whenever it changes (window resize, orientation change). Backed by a
 * single module-level `resize` listener regardless of caller count, so
 * mounting in many components is cheap.
 */
export function useWindowSize(): WindowSize {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
