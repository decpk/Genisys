import { useTimerStore } from '@/store/timer-store'

export interface UseTimerCardDataReturn {
  start: (id: string) => void
  pause: (id: string) => void
  reset: (id: string) => void
  skip: (id: string) => void
  remove: (id: string) => void
  setPrimary: (id: string) => void
  primaryId: string | null
}

export function useTimerCardData(): UseTimerCardDataReturn {
  const start = useTimerStore((s) => s.startTimer)
  const pause = useTimerStore((s) => s.pauseTimer)
  const reset = useTimerStore((s) => s.resetTimer)
  const skip = useTimerStore((s) => s.skipPhase)
  const remove = useTimerStore((s) => s.removeInstance)
  const setPrimary = useTimerStore((s) => s.setPrimary)
  const primaryId = useTimerStore((s) => s.primaryId)
  return { start, pause, reset, skip, remove, setPrimary, primaryId }
}
