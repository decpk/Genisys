import {
  BookOpen,
  Bookmark,
  Globe,
  Headphones,
  Highlighter,
  Sparkles,
} from 'lucide-react'

import type { AppCatalogEntry } from '../../AppStore.types'

export const libraryApp: AppCatalogEntry = {
  id: 'library',
  name: 'Library',
  tagline: 'Read anything. Remember everything.',
  description:
    'Library is your personal reading workspace. Save web articles, books, PDFs, and local files into one place, then read them in a clean, distraction-free view. Highlight inline with color-coded annotations that stay with the document, ask AI for instant summaries, and keep everything tagged, grouped, and searchable so nothing you read is ever lost.',
  category: 'productivity',
  icon: BookOpen,
  accentColor: '#EAB308',
  features: [
    {
      icon: Globe,
      title: 'Save anything',
      description: 'Web articles, PDFs, and local files into one library.',
    },
    {
      icon: Highlighter,
      title: 'Inline highlights',
      description: 'Color-coded annotations that travel with the document.',
    },
    {
      icon: Bookmark,
      title: 'Smart bookmarks',
      description: 'Tag, group, and search across everything you\'ve saved.',
    },
    {
      icon: Sparkles,
      title: 'AI summaries',
      description: 'Get the gist of any article in seconds.',
    },
    {
      icon: Headphones,
      title: 'Distraction-free mode',
      description: 'Hide every chrome panel for deep reading.',
    },
  ],
  version: '2.2',
}
