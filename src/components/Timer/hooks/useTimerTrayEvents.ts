import { useEffect } from 'react'
import { listen, type UnlistenFn } from '@tauri-apps/api/event'

import { useTimerStore } from '@/store/timer-store'
import { useNavigationStore } from '@/store/navigation-store'
import { useSettingsStore } from '@/store/settings-store'

/**
 * Subscribes to tray-emitted Tauri events so the menubar timer tray can
 * drive the primary timer instance and bring the Timer app to focus.
 *
 * Mounted once at the app shell.
 */
export function useTimerTrayEvents(): void {
  useEffect(() => {
    const unlistens: UnlistenFn[] = []
    let cancelled = false

    const subscribe = async (): Promise<void> => {
      const u1 = await listen('timer-tray://pause-resume', () => {
        if (!useSettingsStore.getState().isAppEnabled('timer')) return
        const s = useTimerStore.getState()
        const id = s.primaryId ?? s.instances[0]?.id
        if (!id) return
        const inst = s.instances.find((i) => i.id === id)
        if (!inst) return
        if (inst.isRunning) s.pauseTimer(id)
        else s.startTimer(id)
      })
      const u2 = await listen('timer-tray://reset', () => {
        if (!useSettingsStore.getState().isAppEnabled('timer')) return
        const s = useTimerStore.getState()
        const id = s.primaryId ?? s.instances[0]?.id
        if (!id) return
        s.resetTimer(id)
      })
      const u3 = await listen('timer-tray://open', () => {
        useNavigationStore.getState().setActiveApp('timer')
      })
      if (cancelled) {
        u1()
        u2()
        u3()
        return
      }
      unlistens.push(u1, u2, u3)
    }

    void subscribe()

    return () => {
      cancelled = true
      for (const u of unlistens) u()
    }
  }, [])
}
