import {
  Play,
  Repeat,
  Sparkles,
  Workflow,
  Wrench,
  Zap,
} from 'lucide-react'

import type { AppCatalogEntry } from '../../AppStore.types'

export const autoflowApp: AppCatalogEntry = {
  id: 'autoflow',
  name: 'Autoflow',
  tagline: 'Automate the boring stuff with AI flows.',
  description:
    'Autoflow lets you chain AI calls, tool runs, and conditional logic into reusable visual flows — think deep-research pipelines, batch file transforms, or multi-step refactors, all wired together without code. Drop in AI-native steps that read the flow state as context, plug in file, search, HTTP, and other tools, and add for-each, branching, and retry primitives to handle real-world edge cases. Long flows keep running in the background while you work, and any saved flow re-runs from a single click. Autoflow is still in active development.',
  category: 'ai',
  icon: Workflow,
  accentColor: '#A855F7',
  features: [
    {
      icon: Workflow,
      title: 'Visual flow editor',
      description: 'Wire steps together without code.',
    },
    {
      icon: Wrench,
      title: 'Tool catalog',
      description: 'Plug in file ops, search, HTTP, and AI tools.',
    },
    {
      icon: Sparkles,
      title: 'AI-native steps',
      description: 'Drop in prompts that read flow state as context.',
    },
    {
      icon: Play,
      title: 'One-click runs',
      description: 'Re-run any saved flow from a single button.',
    },
    {
      icon: Repeat,
      title: 'Looping & branching',
      description: 'For-each, conditional, and retry primitives built in.',
    },
    {
      icon: Zap,
      title: 'Background execution',
      description: 'Long flows keep running while you work.',
    },
  ],
  version: '1.2',
  status: 'in-development',
}
