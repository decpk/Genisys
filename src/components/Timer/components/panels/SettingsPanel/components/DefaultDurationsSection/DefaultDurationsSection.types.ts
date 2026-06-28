import type { TimerSettings } from '@/store/timer-store/timer-store.types'

export interface DefaultDurationsSectionProps {
  settings: TimerSettings
  onChange: (partial: Partial<TimerSettings>) => void
}

export interface DurationRowConfig {
  key: 'defaultDurationSec' | 'shortBreakDurationSec' | 'longBreakDurationSec'
  label: string
  minSec: number
  maxSec: number
  stepSec: number
}
