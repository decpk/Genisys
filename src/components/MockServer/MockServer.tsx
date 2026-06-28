import { ScrollText, Sparkles } from 'lucide-react'

import { AppShell } from '@/components/AppShell'
import { AppShellLoader } from '@/components/AppLoader'
import { RightPanel } from '@/components/RightPanel'
import { RightPanelTabs } from '@/frameworks/right-panel'
import type { PanelDef } from '@/frameworks/right-panel'
import { AIAssistantPanel } from '@/right-panels/AIAssistantPanel'

import { useMockServerData } from './useMockServerData'
import { MockServerSidebar } from './components/MockServerSidebar'
import { MockServerMainContent } from './components/MockServerMainContent'
import { MockServerEmptyState } from './components/MockServerEmptyState'
import { RequestLogPanel } from './components/RequestLog/RequestLogPanel'
import { MockServerAIAssistantWrapper } from './ai'
import { useReportMockServerBusy } from './hooks/useReportMockServerBusy'

const MOCKSERVER_PANELS: PanelDef[] = [
  {
    id: 'ai-assistant',
    label: 'AI Assistant',
    icon: Sparkles,
    component: AIAssistantPanel,
    wrapper: MockServerAIAssistantWrapper,
    defaultTab: true,
  },
  {
    id: 'request-log',
    label: 'Request Log',
    icon: ScrollText,
    component: RequestLogPanel,
  },
]

export function MockServer(): React.JSX.Element {
  const { isLoaded, selectedServerId } = useMockServerData()
  useReportMockServerBusy()

  if (!isLoaded) return <AppShellLoader />

  const mainContent = selectedServerId
    ? <MockServerMainContent />
    : <MockServerEmptyState />

  return (
    <AppShell
      appId="mockserver"
      sidebar={<MockServerSidebar />}
      sidebarWidth={280}
      sidebarMinWidth={220}
      sidebarMaxWidth={400}
      showTerminal
      rightPanel={
        <RightPanel
          appId="mockserver-logs"
          defaultWidth={340}
          minWidth={260}
          maxWidth={500}
          defaultOpen
        >
          <RightPanelTabs panels={MOCKSERVER_PANELS} />
        </RightPanel>
      }
    >
      {mainContent}
    </AppShell>
  )
}
