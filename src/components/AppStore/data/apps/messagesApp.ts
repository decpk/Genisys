import {
  MessagesSquare,
  Phone,
  Radar,
  ShieldCheck,
  Users,
} from 'lucide-react'

import type { AppCatalogEntry } from '../../AppStore.types'

export const messagesApp: AppCatalogEntry = {
  id: 'messages',
  name: 'Messages',
  tagline: 'Chat & call everyone on your Wi-Fi — no sign-in.',
  description:
    'Messages turns your local network into a private place to talk. It automatically discovers other Genisys users on the same Wi-Fi, then lets you message them one-to-one and start voice or video calls — all peer-to-peer, with nothing routed through the cloud or tied to an account. Live presence shows who is around, and a peer info panel keeps details about whoever you are talking to one click away.',
  category: 'system',
  icon: MessagesSquare,
  accentColor: '#3B82F6',
  features: [
    {
      icon: Radar,
      title: 'Automatic peer discovery',
      description:
        'Finds everyone running Genisys on your Wi-Fi — no contacts or sign-up.',
    },
    {
      icon: MessagesSquare,
      title: 'Direct messaging',
      description: 'Chat one-to-one; messages travel straight device-to-device.',
    },
    {
      icon: Phone,
      title: 'Voice & video calls',
      description: 'Start a voice or video call with any peer from the conversation.',
    },
    {
      icon: Users,
      title: 'Live presence',
      description: 'See who is online at a glance with real-time presence.',
    },
    {
      icon: ShieldCheck,
      title: 'Stays on your LAN',
      description: 'Conversations and calls never leave your local network.',
    },
  ],
  version: '1.0',
}
