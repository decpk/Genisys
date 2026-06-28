import { Clock, Settings, Target, BarChart3 } from 'lucide-react'

import type { PanelDef } from '@/frameworks/right-panel'

import { GoalsPanel } from '../components/panels/GoalsPanel'
import { HistoryPanel } from '../components/panels/HistoryPanel'
import { SettingsPanel } from '../components/panels/SettingsPanel'
import { StatsPanel } from '../components/panels/StatsPanel'

export const TIMER_PANELS: PanelDef[] = [
  {
    id: 'history',
    label: 'History',
    icon: Clock,
    component: HistoryPanel,
    defaultTab: true,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    component: SettingsPanel,
  },
  {
    id: 'goals',
    label: 'Goals',
    icon: Target,
    component: GoalsPanel,
  },
  {
    id: 'stats',
    label: 'Stats',
    icon: BarChart3,
    component: StatsPanel,
  },
]
