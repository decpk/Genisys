import type { TimerSession } from '@/store/timer-store/timer-store.types'

export function computeGroupTotalMinutes(items: TimerSession[]): number {
  let total = 0
  for (const s of items) total += s.durationSec ?? 0
  return Math.round(total / 60)
}
