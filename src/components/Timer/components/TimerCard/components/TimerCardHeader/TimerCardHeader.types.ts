import type { TimerInstance } from '@/store/timer-store/timer-store.types'

export interface TimerCardHeaderProps {
  instance: TimerInstance
  onRemove: () => void
  accentColor?: string
  isRunning?: boolean
  rightSlot?: React.ReactNode
}
