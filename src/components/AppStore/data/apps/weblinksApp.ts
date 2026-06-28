import {
  Bookmark,
  FolderTree,
  Image,
  Link,
  Sparkles,
  SquareArrowOutUpRight,
} from 'lucide-react'

import type { AppCatalogEntry } from '../../AppStore.types'

export const weblinksApp: AppCatalogEntry = {
  id: 'weblinks',
  name: 'WebLinks',
  tagline: 'Save, organize, and open any link.',
  description:
    'WebLinks turns any URL into a rich saved link (title, site, description, image). Paste a link to save it, organize links into folders, import bookmarks from your browser, extract links from a screenshot, and let AI save and organize links for you.',
  category: 'productivity',
  icon: Link,
  accentColor: '#0EA5E9',
  features: [
    {
      icon: Link,
      title: 'Quick add',
      description: 'Paste a URL to save it as a rich link with metadata.',
    },
    {
      icon: SquareArrowOutUpRight,
      title: 'Open anywhere',
      description: 'Jump to any saved link in your default browser in one click.',
    },
    {
      icon: Bookmark,
      title: 'Collections',
      description: 'Keep your saved links organized and easy to revisit.',
    },
    {
      icon: FolderTree,
      title: 'Folders',
      description: 'Group saved links into folders and categories.',
    },
    {
      icon: Sparkles,
      title: 'AI assistant',
      description: 'Ask AI to save, open, and organize your links for you.',
    },
    {
      icon: Image,
      title: 'Screenshot to URLs',
      description: 'Extract links from a screenshot of your browser tabs.',
    },
  ],
  version: '1.0',
}
