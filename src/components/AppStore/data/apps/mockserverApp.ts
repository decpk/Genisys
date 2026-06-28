import {
  Layers,
  Network,
  Play,
  Server,
  Sparkles,
  Timer,
} from 'lucide-react'

import type { AppCatalogEntry } from '../../AppStore.types'

export const mockserverApp: AppCatalogEntry = {
  id: 'mockserver',
  name: 'Mock Server',
  tagline: 'Stand up a fake API in seconds.',
  description:
    'Mock Server lets you stand up local HTTP endpoints in seconds, so you can build and test against a realistic API without waiting on a live backend. Define routes that return any status code, headers, and JSON or binary payload, then switch between happy-path, error, and edge-case scenarios on the fly. Simulate network latency to exercise loading states, and let AI scaffold an endpoint with sample data from a plain-English description.',
  category: 'development',
  icon: Server,
  accentColor: '#14B8A6',
  features: [
    {
      icon: Play,
      title: 'One-click start',
      description: 'Boot a mock server with your routes in milliseconds.',
    },
    {
      icon: Network,
      title: 'Realistic responses',
      description: 'Status codes, headers, JSON, and binary payloads.',
    },
    {
      icon: Layers,
      title: 'Scenarios',
      description: 'Switch between happy path, error, and edge-case responses.',
    },
    {
      icon: Timer,
      title: 'Latency simulation',
      description: 'Test loading states with configurable delays.',
    },
    {
      icon: Sparkles,
      title: 'AI route generation',
      description: 'Describe an endpoint; get a stub with sample data.',
    },
  ],
  version: '1.0',
}
