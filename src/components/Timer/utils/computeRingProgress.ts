import type { TimerInstance } from '@/store/timer-store/timer-store.types'

export function computeRingProgress(instance: TimerInstance): number {
  if (instance.mode === 'stopwatch') return 1
  if (!instance.durationSec || instance.durationSec <= 0) return 0
  const ratio = 1 - instance.remainingSec / instance.durationSec
  if (ratio < 0) return 0
  if (ratio > 1) return 1
  return ratio
}
