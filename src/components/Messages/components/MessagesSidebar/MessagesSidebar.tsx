import { MessagesSquare, Radar, ShieldCheck } from 'lucide-react'

import { IdentityCard } from './components/IdentityCard'
import { IncomingRequests } from './components/IncomingRequests'
import { ManualConnectDialog } from './components/ManualConnectDialog'
import { PeerSection } from './components/PeerSection'
import { SidebarSearch } from './components/SidebarSearch'
import { messagesSidebarStyles as s } from './MessagesSidebar.styles'
import { useMessagesSidebarData } from './useMessagesSidebarData'

export function MessagesSidebar(): React.JSX.Element {
  const { discovered, connected, searchQuery, setSearchQuery } =
    useMessagesSidebarData()

  return (
    <div className={s.root}>
      <div className={s.header}>
        <span className={s.headerIcon}>
          <MessagesSquare className="h-4 w-4" />
        </span>
        <span className={s.headerTitle}>Messages</span>
      </div>

      <div className={s.identity}>
        <IdentityCard />
      </div>

      <div className={s.connectWrap}>
        <ManualConnectDialog />
      </div>

      <IncomingRequests />

      <div className={s.search}>
        <SidebarSearch value={searchQuery} onChange={setSearchQuery} />
      </div>

      <div className={s.sections}>
        <PeerSection
          title="Conversations"
          icon={MessagesSquare}
          peers={connected}
          variant="conversation"
          emptyLabel="No conversations yet. Connect to a peer to start."
        />
        <PeerSection
          title="On your network"
          icon={Radar}
          peers={discovered}
          variant="discovered"
          emptyLabel="Looking for peers on your local network…"
        />
      </div>

      <div className={s.footer}>
        <ShieldCheck className={s.footerIcon} />
        <span>
          Messages stay on your device — end-to-end encrypted, nothing stored.
        </span>
      </div>
    </div>
  )
}
