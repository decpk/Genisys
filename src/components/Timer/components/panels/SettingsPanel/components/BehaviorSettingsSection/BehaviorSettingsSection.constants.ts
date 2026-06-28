import { Bell, MonitorSmartphone, Play, Sparkles } from 'lucide-react'

import type { BehaviorRowConfig } from './BehaviorSettingsSection.types'

export const BEHAVIOR_ROWS: ReadonlyArray<BehaviorRowConfig> = [
  {
    key: 'autoStartBreak',
    icon: Play,
    label: 'Auto-start break',
    description: 'Begin the break automatically after a work session',
  },
  {
    key: 'notificationsEnabled',
    icon: Bell,
    label: 'Notifications',
    description: 'Show a notification when a phase completes',
  },
  {
    key: 'showTrayCountdown',
    icon: MonitorSmartphone,
    label: 'Tray countdown',
    description: 'Display the remaining time in the menu bar',
  },
  {
    key: 'sidebarRowProgressBg',
    icon: Sparkles,
    label: 'Sidebar progress fill',
    description: 'Fill the active timer row background with progress color',
  },
]
