import {
  FileText,
  Hash,
  Image,
  NotebookPen,
  Search,
  Sparkles,
} from 'lucide-react'

import type { AppCatalogEntry } from '../../AppStore.types'

export const notesApp: AppCatalogEntry = {
  id: 'notes',
  name: 'Notes',
  tagline: 'A fast, structured notes app for engineers.',
  description:
    'Notes is a Markdown-first editor built for engineers who think in code and text. Write with live preview, syntax-highlighted code blocks, and paste images or files straight in, then find anything later with instant full-text search. Organize with tags and folders, and call on AI to summarize, expand, or rewrite a selection inline as you grow your second brain.',
  category: 'productivity',
  icon: NotebookPen,
  accentColor: '#6366F1',
  features: [
    {
      icon: FileText,
      title: 'Markdown editor',
      description: 'Live preview, code blocks, and rich formatting.',
    },
    {
      icon: Hash,
      title: 'Tags & folders',
      description: 'Organize notes the way that fits your brain.',
    },
    {
      icon: Image,
      title: 'Paste anything',
      description: 'Images, screenshots, and files paste right in.',
    },
    {
      icon: Search,
      title: 'Full-text search',
      description: 'Find any note in milliseconds, even huge ones.',
    },
    {
      icon: Sparkles,
      title: 'AI-assisted writing',
      description: 'Summarize, expand, or rewrite selections inline.',
    },
  ],
  version: '2.0',
}
