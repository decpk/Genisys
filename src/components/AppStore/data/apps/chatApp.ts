import {
  Bot,
  BotMessageSquare,
  Brain,
  FileText,
  History,
  Wrench,
} from 'lucide-react'

import type { AppCatalogEntry } from '../../AppStore.types'

export const chatApp: AppCatalogEntry = {
  id: 'chat',
  name: 'Chat',
  tagline: 'A focused AI workspace for engineers.',
  description:
    'Chat is the local-first AI assistant at the heart of Genisys. Switch between agent modes, drop in files or folders as context, run tools, and resume past conversations — all without sending your code to a third-party cloud unless you choose to.',
  category: 'ai',
  icon: BotMessageSquare,
  accentColor: '#10B981',
  features: [
    {
      icon: Brain,
      title: 'Agent modes',
      description: 'Plan, code, review, and research with mode-specific prompts.',
    },
    {
      icon: Wrench,
      title: 'Tool calls',
      description: 'Read files, run terminals, and edit code right from chat.',
    },
    {
      icon: FileText,
      title: 'Drag-in context',
      description: 'Drop files, folders, or selections into the conversation.',
    },
    {
      icon: History,
      title: 'Conversation history',
      description: 'Search and reopen any past chat instantly.',
    },
    {
      icon: Bot,
      title: 'Multi-model',
      description: 'Bring your own keys for any major LLM provider.',
    },
  ],
  version: '4.0',
  featured: true,
}
