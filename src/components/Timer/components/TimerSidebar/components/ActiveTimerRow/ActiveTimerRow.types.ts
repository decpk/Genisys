import type { TimerInstance } from '@/store/timer-store/timer-store.types'

export interface ActiveTimerRowProps {
  instance: TimerInstance
  isPrimary: boolean
  onSelect: () => void
  onRemove: () => void
}
