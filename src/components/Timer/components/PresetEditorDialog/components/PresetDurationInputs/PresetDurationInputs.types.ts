import type { TimerMode } from '@/store/timer-store/timer-store.types'

export interface PresetDurationInputsProps {
  mode: TimerMode
  workSec: number
  breakSec: number
  onWorkChange: (sec: number) => void
  onBreakChange: (sec: number) => void
}
