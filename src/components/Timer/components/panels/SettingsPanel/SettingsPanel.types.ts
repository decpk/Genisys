import type { TimerSettings } from '@/store/timer-store/timer-store.types'

export interface SettingsPanelData {
  settings: TimerSettings
  updateSettings: (partial: Partial<TimerSettings>) => void
}
