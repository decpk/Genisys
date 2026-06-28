import {
  ClipboardPaste,
  History,
  Lock,
  Pin,
  ScanText,
  Search,
  Tags,
} from 'lucide-react'

import type { AppCatalogEntry } from '../../AppStore.types'

export const clipboardApp: AppCatalogEntry = {
  id: 'clipboard',
  name: 'Clipboard',
  tagline: 'Never lose what you just copied.',
  description:
    'Clipboard is a smart clipboard manager that quietly captures everything you copy — text, code, and images — and keeps it searchable forever, all stored locally. It detects code and renders it with syntax highlighting, extracts text from copied screenshots with built-in OCR, and auto-flags sensitive data so secrets are easy to keep out. Organize clips with labels and smart collections, scrub back through a visual timeline, and pin the snippets you reuse so they never expire.',
  category: 'productivity',
  icon: ClipboardPaste,
  accentColor: '#F43F5E',
  features: [
    {
      icon: History,
      title: 'Unlimited history',
      description: 'Every copy — text, code, and images — kept locally and searchable.',
    },
    {
      icon: ScanText,
      title: 'Text from images',
      description: 'Extract text from copied screenshots with built-in OCR.',
    },
    {
      icon: Tags,
      title: 'Labels & collections',
      description: 'Tag clips and auto-group them into smart collections.',
    },
    {
      icon: Search,
      title: 'Fuzzy search',
      description: 'Find old clips by text, source app, or time.',
    },
    {
      icon: Pin,
      title: 'Pin favorites',
      description: 'Pin snippets you reuse so they never expire.',
    },
    {
      icon: Lock,
      title: 'Privacy first',
      description: 'Sensitive data is flagged and private apps are never captured.',
    },
  ],
  version: '1.5',
}
