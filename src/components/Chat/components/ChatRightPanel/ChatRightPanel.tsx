import { useState, useEffect, useRef, useCallback } from 'react'
import { Activity, BookOpen, Code, Plug, Sparkles, Terminal } from 'lucide-react'

import { RightPanelTabs, type PanelDef } from '@/frameworks/right-panel'
import { useChatHistoryStore } from '@/store/chat-history-store'

import { SourcePanel } from '../SourcePanel'
import { ActivityPanel } from './components/ActivityPanel'
import { PromptsPanel } from './components/PromptsPanel'
import { SnippetsPanel } from './components/SnippetsPanel'
import { CommandsPanel } from './components/CommandsPanel'
import { McpServersPanel } from './components/McpServersPanel'
import { InsertSnippetProvider } from './InsertSnippetContext'

const CHAT_PANELS: PanelDef[] = [
  { id: 'sources', label: 'Sources', icon: BookOpen, component: SourcePanel, defaultTab: true },
  { id: 'commands', label: 'Commands', icon: Terminal, component: CommandsPanel },
  { id: 'prompts', label: 'Prompts', icon: Sparkles, component: PromptsPanel },
  { id: 'snippets', label: 'Snippets', icon: Code, component: SnippetsPanel },
  { id: 'activity', label: 'Activity', icon: Activity, component: ActivityPanel },
  { id: 'mcp', label: 'MCP Servers', icon: Plug, component: McpServersPanel },
]

interface ChatRightPanelProps {
  onInsertSnippet?: (content: string) => void
}

export function ChatRightPanel({ onInsertSnippet }: ChatRightPanelProps): React.JSX.Element {
  const activeSources = useChatHistoryStore((s) => s.activeSources)
  const activeCitation = useChatHistoryStore((s) => s.activeCitation)
  const activitySummaries = useChatHistoryStore((s) => s.activitySummaries)
  const [activeTab, setActiveTab] = useState('sources')
  const prevSourceCount = useRef(activeSources.length)
  const prevSummaryCount = useRef(activitySummaries.length)

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId)
  }, [])

  // Auto-switch to sources tab when sources are newly attached or citation is clicked
  // Auto-switch to activity tab when new tool calls arrive
  useEffect(() => {
    if (activeCitation) {
      setActiveTab('sources')
      return
    }
    if (activeSources.length > 0 && prevSourceCount.current === 0) {
      setActiveTab('sources')
    }
    prevSourceCount.current = activeSources.length
  }, [activeSources.length, activeCitation])

  useEffect(() => {
    if (activitySummaries.length > prevSummaryCount.current && prevSummaryCount.current === 0) {
      setActiveTab('activity')
    }
    prevSummaryCount.current = activitySummaries.length
  }, [activitySummaries.length])

  return (
    <InsertSnippetProvider onInsertSnippet={onInsertSnippet}>
      <RightPanelTabs
        panels={CHAT_PANELS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </InsertSnippetProvider>
  )
}
