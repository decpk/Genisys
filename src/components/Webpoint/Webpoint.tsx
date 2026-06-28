import { Sparkles } from 'lucide-react'

import { AppShell } from '@/components/AppShell'
import { RightPanel } from '@/components/RightPanel'
import { RightPanelTabs } from '@/frameworks/right-panel'
import type { PanelDef } from '@/frameworks/right-panel'
import { AIAssistantPanel } from '@/right-panels/AIAssistantPanel'
import { useWebpointAIStore } from '@/store/webpoint-ai-store'
import { useWebpointStore } from '@/store/webpoint-store'

import { WebpointAIAssistantWrapper } from './components/WebpointAIAssistantWrapper'
import { WebpointHome } from './components/WebpointHome'
import { WebpointMain } from './components/WebpointMain'
import { WebpointPresent } from './components/WebpointPresent'
import { WebpointSidebar } from './components/WebpointSidebar'

const WEBPOINT_PANELS: PanelDef[] = [
  {
    id: 'ai-assistant',
    label: 'AI Assistant',
    icon: Sparkles,
    component: AIAssistantPanel,
    wrapper: WebpointAIAssistantWrapper,
    defaultTab: true,
  },
]

export function Webpoint(): React.JSX.Element {
  const activePresentationId = useWebpointStore((s) => s.activePresentationId)
  const panelOpen = useWebpointAIStore((s) => s.panelOpen)
  const setPanelOpen = useWebpointAIStore((s) => s.setPanelOpen)
  const isPresenting = useWebpointAIStore((s) => s.isPresenting)

  if (!activePresentationId) {
    return <WebpointHome />
  }

  return (
    <>
      <AppShell
        appId="webpoint"
        sidebar={<WebpointSidebar />}
        rightPanel={
          <RightPanel
            appId="webpoint-ai"
            defaultWidth={360}
            minWidth={300}
            maxWidth={560}
            open={panelOpen}
            onOpenChange={setPanelOpen}
          >
            <RightPanelTabs panels={WEBPOINT_PANELS} />
          </RightPanel>
        }
      >
        <WebpointMain />
      </AppShell>
      {isPresenting && <WebpointPresent />}
    </>
  )
}
