import { Sparkles } from 'lucide-react'

import { AppShell } from '@/components/AppShell/AppShell'
import { RightPanel } from '@/components/RightPanel'
import { RightPanelTabs } from '@/frameworks/right-panel'
import type { PanelDef } from '@/frameworks/right-panel'
import { AIAssistantPanel } from '@/right-panels/AIAssistantPanel'

import { WebLinksSidebar } from './components/WebLinksSidebar'
import { WebLinksMain } from './components/WebLinksMain'
import { WebLinksAIAssistantWrapper } from './components/WebLinksAIAssistantWrapper'
import { useWebLinksData } from './useWebLinksData'

const WEBLINKS_PANELS: PanelDef[] = [
  {
    id: 'ai-assistant',
    label: 'AI Assistant',
    icon: Sparkles,
    component: AIAssistantPanel,
    wrapper: WebLinksAIAssistantWrapper,
    defaultTab: true,
  },
]

/**
 * Root view for the WebLinks app. Hosts the collections sidebar and the main
 * column inside an `AppShell`. The root hook loads folders + saved links once
 * on mount; all other behavior lives in the children's hooks.
 */
export function WebLinks(): React.JSX.Element {
  useWebLinksData()

  return (
    <AppShell
      appId="weblinks"
      sidebar={<WebLinksSidebar />}
      sidebarWidth={260}
      sidebarMinWidth={200}
      sidebarMaxWidth={360}
      rightPanel={
        <RightPanel
          appId="weblinks-ai"
          defaultWidth={400}
          minWidth={260}
          maxWidth={600}
          defaultOpen
        >
          <RightPanelTabs panels={WEBLINKS_PANELS} />
        </RightPanel>
      }
    >
      <WebLinksMain />
    </AppShell>
  )
}
