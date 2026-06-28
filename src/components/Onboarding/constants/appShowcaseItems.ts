import {
  BookOpen,
  BotMessageSquare,
  CalendarCheck,
  FolderTree,
  GitPullRequest,
  LayoutDashboard,
  NotebookPen,
  Presentation,
  ScanSearch,
  Send,
  Server,
  SquareKanban,
  Workflow,
} from 'lucide-react'

import type { AppShowcaseItem } from '../Onboarding.types'

export const APP_SHOWCASE_ITEMS: ReadonlyArray<AppShowcaseItem> = [
  {
    id: 'dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard',
    description: 'Your home base — quick access to projects, snippets, and tiles.',
  },
  {
    id: 'dailyplan',
    icon: CalendarCheck,
    label: 'Daily Plan',
    description: 'Plan your day with tasks, meetings, and status updates.',
  },
  {
    id: 'notes',
    icon: NotebookPen,
    label: 'Notes',
    description: 'Organize notes in notebooks with labels and sections.',
  },
  {
    id: 'library',
    icon: BookOpen,
    label: 'Library',
    description: 'Read and manage books with bookmarks and highlights.',
  },
  {
    id: 'explorer',
    icon: FolderTree,
    label: 'Explorer',
    description: 'Browse and manage local repositories and files.',
  },
  {
    id: 'chat',
    icon: BotMessageSquare,
    label: 'Chat',
    description: 'AI-powered chat assistant with tool calling.',
  },
  {
    id: 'apiclient',
    icon: Send,
    label: 'API Client',
    description: 'Send HTTP requests, manage collections and environments.',
  },
  {
    id: 'mockserver',
    icon: Server,
    label: 'Mock Server',
    description: 'Spin up local mock API servers for development.',
  },
  {
    id: 'autoflow',
    icon: Workflow,
    label: 'Autoflow',
    description: 'Automated workflows and pipeline orchestration.',
  },
  {
    id: 'webpoint',
    icon: Presentation,
    label: 'WebPoint',
    description: 'Generate and edit AI-powered slide decks.',
  },
]
