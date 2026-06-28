import {
  Bell,
  CheckCircle2,
  LayoutDashboard,
  PinIcon,
  Settings2,
} from 'lucide-react'

import type { AppCatalogEntry } from '../../AppStore.types'

export const dashboardApp: AppCatalogEntry = {
  id: 'dashboard',
  name: 'Dashboard',
  tagline: 'Your Genisys home base.',
  description:
    'The Dashboard is the always-on home of Genisys — the one app that can never be turned off. It is a tile-based, fully customizable surface that brings the few things you actually need into a single glance: your plan for the day, recent activity, quick prompts, time and weather, and pinned shortcuts. Resize, reorder, hide, or show any tile so the layout matches exactly how you work.',
  category: 'productivity',
  icon: LayoutDashboard,
  accentColor: '#0EA5E9',
  features: [
    {
      icon: LayoutDashboard,
      title: 'Tile-based layout',
      description: 'Arrange widgets in full, half, third, and small sizes.',
    },
    {
      icon: PinIcon,
      title: 'Pin what matters',
      description: 'Show only the tiles you use; hide the rest.',
    },
    {
      icon: CheckCircle2,
      title: 'Daily Plan at a glance',
      description: 'See today\'s tasks without leaving the home view.',
    },
    {
      icon: Bell,
      title: 'Live activity feed',
      description: 'Recent actions, notifications, and reminders in one place.',
    },
    {
      icon: Settings2,
      title: 'Fully configurable',
      description: 'Per-tile width and visibility controls in Settings.',
    },
  ],
  version: '1.0',
  featured: true,
  locked: true,
}
