import { useEffect } from 'react'

import { useTimerStore } from '@/store/timer-store'
import type { TimerInstance } from '@/store/timer-store/timer-store.types'

export interface UseTimerFocusMiniAppDataResult {
  primary: TimerInstance | null
  isHydrated: boolean
  toggle: () => void
  close: () => void
}

export function useTimerFocusMiniAppData(): UseTimerFocusMiniAppDataResult {
  const isHydrated = useTimerStore((s) => s.isHydrated)
  const hydrate = useTimerStore((s) => s.hydrate)
  const instances = useTimerStore((s) => s.instances)
  const primaryId = useTimerStore((s) => s.primaryId)
  const startTimer = useTimerStore((s) => s.startTimer)
  const pauseTimer = useTimerStore((s) => s.pauseTimer)

  useEffect(() => {
    if (!isHydrated) hydrate()
  }, [isHydrated, hydrate])

  const primary =
    (primaryId ? instances.find((i) => i.id === primaryId) : null) ??
    instances[0] ??
    null

  const toggle = (): void => {
    if (!primary) return
    if (primary.isRunning) pauseTimer(primary.id)
    else startTimer(primary.id)
  }

  const close = (): void => {
    const api = (window as unknown as {
      api?: { closeTimerFocusWindow?: () => Promise<unknown> }
    }).api
    if (api?.closeTimerFocusWindow) {
      void api.closeTimerFocusWindow()
    } else {
      window.close()
    }
  }

  return { primary, isHydrated, toggle, close }
}
