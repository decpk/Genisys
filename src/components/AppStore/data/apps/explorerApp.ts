import {
  FolderTree,
  GitBranch,
  MousePointerClick,
  Search,
  Sparkles,
  Terminal,
} from 'lucide-react'

import type { AppCatalogEntry } from '../../AppStore.types'

export const explorerApp: AppCatalogEntry = {
  id: 'explorer',
  name: 'Explorer',
  tagline: 'Browse, search, and act on any folder on your machine.',
  description:
    'Explorer is a fast project browser with a real terminal, AI-aware actions, and deep Git awareness. Browse huge repositories without lag, see branch and change status inline, and fuzzy-search to any file in milliseconds. Drag any file or folder straight into a Chat as context, open a shell scoped to any directory, or summarize, refactor, and explain selections from an AI context menu — all without leaving Genisys.',
  category: 'development',
  icon: FolderTree,
  accentColor: '#F59E0B',
  features: [
    {
      icon: FolderTree,
      title: 'Virtualized tree',
      description: 'Browse huge repos without lag.',
    },
    {
      icon: GitBranch,
      title: 'Git aware',
      description: 'See branch, status, and changes inline with files.',
    },
    {
      icon: Terminal,
      title: 'Built-in terminal',
      description: 'Open a shell scoped to any folder in one click.',
    },
    {
      icon: MousePointerClick,
      title: 'Drag to AI',
      description: 'Drop any file or folder into a Chat as context.',
    },
    {
      icon: Search,
      title: 'Fuzzy file search',
      description: 'Jump to any file by name with ranked matches.',
    },
    {
      icon: Sparkles,
      title: 'AI context menu',
      description: 'Summarize, refactor, or explain selections in place.',
    },
  ],
  version: '3.0',
  featured: true,
}
