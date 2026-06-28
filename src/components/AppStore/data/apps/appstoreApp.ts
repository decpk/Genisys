import {
  CheckCircle2,
  LayoutGrid,
  Power,
  Search,
  Sparkles,
  Store,
} from 'lucide-react'

import type { AppCatalogEntry } from '../../AppStore.types'

export const appstoreApp: AppCatalogEntry = {
  id: 'appstore',
  name: 'App Store',
  tagline: 'Curate your Genisys — turn apps on and off.',
  description:
    'The App Store is mission control for your Genisys apps. It decides which apps appear in your activity bar — a fresh install starts with a focused set (Dashboard, Messages, API Client, Mock Server, Terminal, and Auto Reviewer), and everything else is one click away. Browse by category, search the full catalog, and open a detailed page for any app to see exactly what it does before you enable it. Archived apps stay available to reinstall, and apps still in development are clearly marked.',
  category: 'system',
  icon: Store,
  accentColor: '#0EA5E9',
  features: [
    {
      icon: Power,
      title: 'Enable & disable',
      description: 'Toggle any app on or off from one place.',
    },
    {
      icon: LayoutGrid,
      title: 'Browse by category',
      description: 'Find apps by Productivity, Development, AI, or System.',
    },
    {
      icon: Search,
      title: 'Search the catalog',
      description: 'Look up apps by name, tagline, or feature.',
    },
    {
      icon: CheckCircle2,
      title: 'Detailed pages',
      description: 'See the features, status, and capabilities of any app before enabling it.',
    },
    {
      icon: Sparkles,
      title: 'Featured picks',
      description: 'Discover apps highlighted for your workflow.',
    },
  ],
  version: '1.0',
  locked: true,
}
