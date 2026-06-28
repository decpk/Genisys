import {
  Code2,
  Folder,
  History,
  Send,
  Share2,
  Sparkles,
  Variable,
} from 'lucide-react'

import type { AppCatalogEntry } from '../../AppStore.types'

export const apiclientApp: AppCatalogEntry = {
  id: 'apiclient',
  name: 'API Client',
  tagline: 'Postman, but native and keyboard-first.',
  description:
    'API Client is a fast, keyboard-first HTTP workbench — Postman power without the bloat. Build and send requests, organize them into shareable collections, and switch base URLs, tokens, and secrets with environment variables. Capture full request history, inspect responses with a structured JSON and cookie viewer, and generate ready-to-paste client code in the language of your choice. AI can draft request bodies for you, and you can import existing Postman or OpenAPI collections in one step.',
  category: 'development',
  icon: Send,
  accentColor: '#F97316',
  features: [
    {
      icon: Folder,
      title: 'Collections',
      description: 'Group requests into folders and share them with your team.',
    },
    {
      icon: Variable,
      title: 'Environments',
      description: 'Swap base URLs, tokens, and secrets with one click.',
    },
    {
      icon: History,
      title: 'Request history',
      description: 'Re-run any past request without losing context.',
    },
    {
      icon: Code2,
      title: 'Code generation',
      description: 'Export any request as curl or client code in your language.',
    },
    {
      icon: Sparkles,
      title: 'AI-generated bodies',
      description: 'Describe what you need; get a valid JSON body.',
    },
    {
      icon: Share2,
      title: 'Import & export',
      description: 'Bring in Postman or OpenAPI collections directly.',
    },
  ],
  version: '1.8',
}
