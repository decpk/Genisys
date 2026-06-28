import {
  CalendarCheck,
  CheckSquare,
  Clock,
  Repeat,
  Search,
  Sparkles,
} from 'lucide-react'

import type { AppCatalogEntry } from '../../AppStore.types'

export const dailyplanApp: AppCatalogEntry = {
  id: 'dailyplan',
  name: 'Daily Plan',
  tagline: 'Plan your day. Track your week. Ship your month.',
  description:
    'Daily Plan is a fast, keyboard-first task tracker built for engineers. Capture tasks the instant they occur to you, organize them day by day, and roll anything unfinished forward automatically. Search across your entire history, set recurring items, and lean on a built-in AI assistant to draft plans, break big tasks down, and summarize what you got done.',
  category: 'productivity',
  icon: CalendarCheck,
  accentColor: '#22C55E',
  features: [
    {
      icon: CheckSquare,
      title: 'Quick capture',
      description: 'Add tasks in one keystroke from anywhere in Genisys.',
    },
    {
      icon: Clock,
      title: 'Day-by-day view',
      description: 'Plan today, tomorrow, and the rest of your week.',
    },
    {
      icon: Repeat,
      title: 'Rollover & repeat',
      description: 'Auto-carry incomplete tasks and set recurring items.',
    },
    {
      icon: Search,
      title: 'Powerful search',
      description: 'Find any task across all days with fuzzy search.',
    },
    {
      icon: Sparkles,
      title: 'AI assistant',
      description: 'Generate plans, summarize the day, and break down work.',
    },
  ],
  version: '2.1',
  featured: true,
}
