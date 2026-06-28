import {
  Bell,
  Coffee,
  Pause,
  Play,
  Timer,
  TrendingUp,
} from 'lucide-react'

import type { AppCatalogEntry } from '../../AppStore.types'

export const timerApp: AppCatalogEntry = {
  id: 'timer',
  name: 'Timer',
  tagline: 'Focus sessions, Pomodoros, and break tracking.',
  description:
    'Timer is your focus companion for deep work. Run Pomodoro sessions or custom intervals, pause and resume when life interrupts, and get gentle break reminders between sprints. A live tray keeps the countdown in view, per-session notes capture what you worked on, and a running history tracks your focus time by day, week, and project.',
  category: 'productivity',
  icon: Timer,
  accentColor: '#DC2626',
  features: [
    {
      icon: Play,
      title: 'One-tap start',
      description: 'Begin a session from the activity bar or shortcut.',
    },
    {
      icon: Pause,
      title: 'Pause & resume',
      description: 'Life happens — pick up exactly where you left off.',
    },
    {
      icon: Coffee,
      title: 'Smart breaks',
      description: 'Automatic break suggestions between sessions.',
    },
    {
      icon: Bell,
      title: 'Gentle alerts',
      description: 'Soft, customizable sounds — no jarring beeps.',
    },
    {
      icon: TrendingUp,
      title: 'Session history',
      description: 'Track focus time per day, week, and project.',
    },
  ],
  version: '1.3',
}
