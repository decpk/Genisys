import type { TimerInstance } from '@/store/timer-store/timer-store.types'

export interface FocusCardLayoutProps {
  instance: TimerInstance
  ringColor: string
  progress: number
  centerLabel: string
  isRunning: boolean
  onStart: () => void
  onPause: () => void
  onReset: () => void
  onSkip: () => void
  onRemove: () => void
}
