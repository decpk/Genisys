import type { TimerInstance } from '@/store/timer-store/timer-store.types'

export interface GridCardLayoutProps {
  instance: TimerInstance
  ringColor: string
  progress: number
  centerLabel: string
  isRunning: boolean
  isPrimary: boolean
  onStart: () => void
  onPause: () => void
  onReset: () => void
  onSkip: () => void
  onRemove: () => void
  onPromote: () => void
}
