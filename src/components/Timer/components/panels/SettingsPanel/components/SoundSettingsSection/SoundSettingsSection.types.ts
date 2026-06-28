import type { TimerSettings } from '@/store/timer-store/timer-store.types'

export interface SoundSettingsSectionProps {
  settings: TimerSettings
  onChange: (partial: Partial<TimerSettings>) => void
}
