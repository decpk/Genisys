import type { LucideIcon } from 'lucide-react'

import type { TimerSettings } from '@/store/timer-store/timer-store.types'

export interface BehaviorSettingsSectionProps {
  settings: TimerSettings
  onChange: (partial: Partial<TimerSettings>) => void
}

export type BehaviorSettingKey =
  | 'autoStartBreak'
  | 'notificationsEnabled'
  | 'showTrayCountdown'
  | 'sidebarRowProgressBg'

export interface BehaviorRowConfig {
  key: BehaviorSettingKey
  icon: LucideIcon
  label: string
  description: string
}
