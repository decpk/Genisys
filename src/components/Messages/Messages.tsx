import { AppShell } from '@/components/AppShell'
import { AppShellLoader } from '@/components/AppLoader'
import { RightPanel } from '@/components/RightPanel'
import { useMessagesStore } from '@/store/messages-store'

import { CallOverlay } from './components/CallOverlay'
import { ConversationView } from './components/ConversationView'
import { IncomingCallPrompt } from './components/IncomingCallPrompt'
import { MessagesSidebar } from './components/MessagesSidebar'
import { PeerInfoPanel } from './components/PeerInfoPanel'
import { useMessagesData } from './hooks/useMessagesData'
import { useReportMessagesBusy } from './hooks/useReportMessagesBusy'

export function Messages(): React.JSX.Element {
  const { isStarted } = useMessagesData()
  const activePeerId = useMessagesStore((s) => s.activePeerId)
  const rightPanelOpen = useMessagesStore((s) => s.rightPanelOpen)
  const setRightPanelOpen = useMessagesStore((s) => s.setRightPanelOpen)
  useReportMessagesBusy()

  if (!isStarted) return <AppShellLoader />

  return (
    <>
      <AppShell
        appId="messages"
        sidebar={<MessagesSidebar />}
        sidebarWidth={400}
        sidebarMinWidth={400}
        rightPanel={
          <RightPanel
            appId="messages"
            defaultWidth={320}
            minWidth={280}
            maxWidth={460}
            forceCollapsed={!activePeerId}
            open={rightPanelOpen}
            onOpenChange={setRightPanelOpen}
            defaultOpen={false}
          >
            <PeerInfoPanel />
          </RightPanel>
        }
      >
        <ConversationView />
      </AppShell>
      <IncomingCallPrompt />
      <CallOverlay />
    </>
  );
}
