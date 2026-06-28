import { useCallback } from 'react'

import { useTimerStore } from '@/store/timer-store'

import {
  TIMER_EMPTY_STATE_QUICK_START_DURATION_SEC,
  TIMER_EMPTY_STATE_QUICK_START_MODE,
  TIMER_EMPTY_STATE_QUICK_START_NAME,
} from './TimerEmptyState.constants'

interface UseTimerEmptyStateDataReturn {
  quickStart: () => void
}

export function useTimerEmptyStateData(): UseTimerEmptyStateDataReturn {
  const createInstance = useTimerStore((s) => s.createInstance)
  const setPrimary = useTimerStore((s) => s.setPrimary)
  const startTimer = useTimerStore((s) => s.startTimer)

  const quickStart = useCallback(() => {
    const id = createInstance({
      mode: TIMER_EMPTY_STATE_QUICK_START_MODE,
      name: TIMER_EMPTY_STATE_QUICK_START_NAME,
      durationSec: TIMER_EMPTY_STATE_QUICK_START_DURATION_SEC,
    })
    if (!id) return
    setPrimary(id)
    startTimer(id)
  }, [createInstance, setPrimary, startTimer])

  return { quickStart }
}
