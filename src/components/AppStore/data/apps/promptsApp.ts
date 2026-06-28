import {
  FolderTree,
  Search,
  Share2,
  Sparkles,
  SquarePen,
  Wand2,
} from 'lucide-react'

import type { AppCatalogEntry } from '../../AppStore.types'

export const promptsApp: AppCatalogEntry = {
  id: 'prompts',
  name: 'Prompts',
  tagline: 'Your personal library of AI prompts.',
  description:
    'Prompts is a fast, organized library for every prompt you reuse. Group prompts into collections and categories, search across your whole library, and drop them into any AI composer in Genisys with one click.',
  category: 'ai',
  icon: Sparkles,
  accentColor: '#A855F7',
  features: [
    {
      icon: FolderTree,
      title: 'Collections & categories',
      description:
        'Organize prompts in a Collection \u2192 Category \u2192 Prompt hierarchy.',
    },
    {
      icon: SquarePen,
      title: 'Markdown editor',
      description: 'Write rich, multi-step prompts with full Markdown support.',
    },
    {
      icon: Wand2,
      title: 'Use in chat',
      description: 'Send any prompt straight into the Chat composer in one click.',
    },
    {
      icon: Search,
      title: 'Fast search',
      description: 'Live-filter prompts by title or description across your library.',
    },
    {
      icon: Share2,
      title: 'Share & import',
      description: 'Export prompts or entire collections and import them anywhere.',
    },
  ],
  version: '1.0',
  featured: true,
}
