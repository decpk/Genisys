import {
  BotMessageSquare,
  ClipboardList,
  Code2,
  GitPullRequest,
  Send,
} from 'lucide-react'

import type { QuitConfirmMarqueeFeature } from './QuitConfirmStayPanel.types'

export const QUIT_CONFIRM_STAY_EYEBROW = 'Before you go'
export const QUIT_CONFIRM_STAY_HEADLINE =
  "Genisys replaces 10+ apps. One window. All powered by AI.";
export const QUIT_CONFIRM_STAY_SUBHEAD =
  "You'd be giving up the few things no other app does in one place."
export const QUIT_CONFIRM_STAY_FOOTER =
  "Quit anyway? Your work isn't auto-restored everywhere."

export const QUIT_CONFIRM_MARQUEE_FEATURES: ReadonlyArray<QuitConfirmMarqueeFeature> = [
  {
    id: 'ai-chat',
    icon: BotMessageSquare,
    label: 'AI Chat with tools',
    tagline: 'Ask, automate, and run actions across every app.',
  },
  {
    id: 'pr-reviewer',
    icon: GitPullRequest,
    label: 'PR Reviewer + Time Machine',
    tagline: 'Review pull requests and replay history inline.',
  },
  {
    id: 'clipboard',
    icon: ClipboardList,
    label: 'Clipboard Manager',
    tagline: 'Searchable, labeled, always-on clipboard history.',
  },
  {
    id: 'api-client',
    icon: Send,
    label: 'API Client + Mock Server',
    tagline: 'Build, send, and mock APIs without switching tools.',
  },
  {
    id: 'code',
    icon: Code2,
    label: 'Code',
    tagline: 'Browse repos, edit files, and diff side-by-side with AI in the same window.',
  },
]
