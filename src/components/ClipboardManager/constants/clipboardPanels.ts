import { Sparkles, Calendar } from 'lucide-react'

import type { PanelDef } from '@/frameworks/right-panel'
import { AIAssistantPanel } from '@/right-panels/AIAssistantPanel'

import { ClipboardAIAssistantWrapper } from '../components/ClipboardAIAssistantWrapper'
import { ClipboardTimelinePanel } from '../components/ClipboardTimelinePanel'
import { ClipboardTimelineWrapper } from '../components/ClipboardTimelineWrapper'

export const CLIPBOARD_PANELS: PanelDef[] = [
  {
    id: 'ai-assistant',
    label: 'AI Assistant',
    icon: Sparkles,
    component: AIAssistantPanel,
    wrapper: ClipboardAIAssistantWrapper,
    defaultTab: true,
  },
  {
    id: 'timeline',
    label: 'Timeline',
    icon: Calendar,
    component: ClipboardTimelinePanel,
    wrapper: ClipboardTimelineWrapper,
  },
]
