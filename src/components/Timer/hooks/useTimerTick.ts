import { useEffect, useRef } from 'react'

import { useTimerStore } from '@/store/timer-store'
import { useSettingsStore } from '@/store/settings-store'
import { formatTimerDisplay } from '@/components/Timer/utils/formatTimerDisplay'

const TICK_INTERVAL_MS = 1000

type TimerTrayApi = {
  setTimerTrayTitle?: (s: string) => Promise<unknown>
  setTimerTrayVisible?: (v: boolean) => Promise<unknown>
}

/**
 * Mounts a single global setInterval that calls `tick()` once per second.
 * Should be mounted once at the app shell so timers continue ticking
 * even when the Timer app view isn't visible.
 *
 * On every tick, also pushes the formatted remaining time of the primary
 * running countdown / pomodoro instance into the menubar tray title (gated
 * by `settings.showTrayCountdown`). The last sent string is memoised to
 * avoid redundant ipc.
 */
export function useTimerTick(): void {
  const lastTrayText = useRef<string | null>(null)
  const timerEnabled = useSettingsStore((s) => s.isAppEnabled('timer'))

  useEffect(() => {
    const api = (window as unknown as { api?: TimerTrayApi }).api

    if (!timerEnabled) {
      // Timer app disabled: freeze any running timers (pause preserves their
      // elapsed time), clear + hide the menubar tray, and don't run the global
      // tick at all. Timers stay paused (state preserved) until re-enabled.
      const state = useTimerStore.getState()
      for (const inst of state.instances) {
        if (inst.isRunning) state.pauseTimer(inst.id)
      }
      lastTrayText.current = ''
      void api?.setTimerTrayTitle?.('')
      void api?.setTimerTrayVisible?.(false)
      return
    }

    // Restore the tray when the Timer app is (re-)enabled.
    void api?.setTimerTrayVisible?.(true)

    const handle = setInterval(() => {
      useTimerStore.getState().tick()
      syncTray(lastTrayText)
    }, TICK_INTERVAL_MS)
    return () => clearInterval(handle)
  }, [timerEnabled])
}

function syncTray(lastTrayText: { current: string | null }): void {
  const api = (window as unknown as { api?: { setTimerTrayTitle?: (s: string) => Promise<unknown> } }).api
  if (!api?.setTimerTrayTitle) return

  const state = useTimerStore.getState()
  if (!state.settings.showTrayCountdown) {
    if (lastTrayText.current !== '') {
      lastTrayText.current = ''
      void api.setTimerTrayTitle('')
    }
    return
  }

  const primaryId = state.primaryId ?? state.instances[0]?.id ?? null
  const primary = primaryId ? state.instances.find((i) => i.id === primaryId) ?? null : null
  if (!primary || primary.mode === 'stopwatch' || !primary.isRunning) {
    if (lastTrayText.current !== '') {
      lastTrayText.current = ''
      void api.setTimerTrayTitle('')
    }
    return
  }

  const text = formatTimerDisplay(primary.remainingSec)
  if (text === lastTrayText.current) return
  lastTrayText.current = text
  void api.setTimerTrayTitle(text)
}
