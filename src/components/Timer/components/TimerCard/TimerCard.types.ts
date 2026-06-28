import type { TimerInstance } from '@/store/timer-store/timer-store.types'

export type TimerCardView = 'focus' | 'grid' | 'compact'

export interface TimerCardProps {
  instance: TimerInstance
  view: TimerCardView
}
