import { useMemo } from 'react'

import { useClipboardStore } from '@/store/clipboard-store'
import { useTimerStore } from '@/store/timer-store'

import type { QuitConfirmLiveSignals } from '../components/QuitConfirmStayPanel/QuitConfirmStayPanel.types'

/**
 * Reads a handful of "is anything active right now?" primitives from the
 * existing stores to drive the live chips in the quit-confirm right pane.
 *
 * IMPORTANT: every selector returns a primitive (number) — never a fresh
 * object/array literal — to avoid the zustand v4 + React 18 snapshot loop.
 */
export function useQuitConfirmLiveSignals(): QuitConfirmLiveSignals {
  const runningTimers = useTimerStore((s) =>
    s.instances.reduce((count, instance) => (instance.isRunning ? count + 1 : count), 0),
  )
  const clipboardCount = useClipboardStore((s) => s.items.length)

  return useMemo(
    () => ({ runningTimers, clipboardCount }),
    [runningTimers, clipboardCount],
  )
}
