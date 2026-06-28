import type { TimerInstance } from '@/store/timer-store/timer-store.types'

export interface ActiveTimersSectionProps {
  instances: TimerInstance[]
  primaryId: string | null
  onSelect: (id: string) => void
  onRemove: (id: string) => void
}
