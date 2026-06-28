import { useEffect } from 'react'

import { useTimerStore } from '@/store/timer-store'
import { useNavigationStore } from '@/store/navigation-store'
import type { TimerInstance, TimerPhase } from '@/store/timer-store/timer-store.types'

import { resolveTimerTileRingColor } from './utils/resolveTimerTileRingColor'

export interface UseTimerTileDataResult {
  primary: TimerInstance | null
  phase: TimerPhase
  remainingSec: number
  isRunning: boolean
  /** Ring fill ratio in [0, 1] for the primary instance. */
  progress: number
  /** Hex color used for the progress ring + accents. */
  ringColor: string
  todaysCompletedSessions: number
  todaysFocusMinutes: number
  weeklyMinutes: number[]
  start: () => void
  pause: () => void
  reset: () => void
  skip: () => void
  openTimerApp: () => void
}

/**
 * Orchestrator for the Dashboard Timer tile. Reads the primary timer
 * instance + aggregates from `useTimerStore`. Hydrates on first mount
 * if the store hasn't been hydrated yet.
 */
export function useTimerTileData(): UseTimerTileDataResult {
  const isHydrated = useTimerStore((s) => s.isHydrated)
  const hydrate = useTimerStore((s) => s.hydrate)

  useEffect(() => {
    if (!isHydrated) hydrate()
  }, [isHydrated, hydrate])

  const instances = useTimerStore((s) => s.instances)
  const primaryId = useTimerStore((s) => s.primaryId)
  const todaysCompletedSessions = useTimerStore((s) => s.todaysCompletedSessions)
  const todaysFocusMinutes = useTimerStore((s) => s.todaysFocusMinutes)
  const weeklyMinutes = useTimerStore((s) => s.weeklyMinutes)
  const createInstance = useTimerStore((s) => s.createInstance)
  const startTimer = useTimerStore((s) => s.startTimer)
  const pauseTimer = useTimerStore((s) => s.pauseTimer)
  const resetTimer = useTimerStore((s) => s.resetTimer)
  const skipPhase = useTimerStore((s) => s.skipPhase)

  const primary =
    (primaryId ? instances.find((i) => i.id === primaryId) : null) ??
    instances[0] ??
    null

  const phase: TimerPhase = primary?.phase ?? 'idle'
  const remainingSec = primary?.remainingSec ?? 0
  const isRunning = primary?.isRunning ?? false

  const durationSec = primary?.durationSec ?? 0
  const progress =
    durationSec > 0 ? Math.min(1, Math.max(0, 1 - remainingSec / durationSec)) : 0
  const ringColor = resolveTimerTileRingColor(phase, primary?.themeId)

  const start = (): void => {
    if (primary) {
      startTimer(primary.id)
      return
    }
    // No timer exists yet (fresh state): create a default countdown timer
    // and start it so the Dashboard Start button works on first use.
    const id = createInstance({ mode: 'countdown' })
    if (id) startTimer(id)
  }
  const pause = (): void => {
    if (primary) pauseTimer(primary.id)
  }
  const reset = (): void => {
    if (primary) resetTimer(primary.id)
  }
  const skip = (): void => {
    if (primary) skipPhase(primary.id)
  }
  const openTimerApp = (): void => {
    useNavigationStore.getState().setActiveApp('timer')
  }

  return {
    primary,
    phase,
    remainingSec,
    isRunning,
    progress,
    ringColor,
    todaysCompletedSessions,
    todaysFocusMinutes,
    weeklyMinutes,
    start,
    pause,
    reset,
    skip,
    openTimerApp,
  }
}
