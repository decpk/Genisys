import { useMemo, useState } from 'react'

import { useMessagesStore } from '@/store/messages-store'

import { filterPeers } from './utils/filterPeers'
import type { MessagesSidebarData } from './MessagesSidebar.types'

export function useMessagesSidebarData(): MessagesSidebarData {
  // Select the stable record references, then derive arrays in useMemo so the
  // selector never returns a fresh literal (avoids render-loop pitfalls).
  const discoveredPeers = useMessagesStore((s) => s.discoveredPeers)
  const connectedPeers = useMessagesStore((s) => s.connectedPeers)

  const [searchQuery, setSearchQuery] = useState('')

  const discoveredAll = useMemo(
    () => Object.values(discoveredPeers),
    [discoveredPeers]
  )
  const connectedAll = useMemo(
    () => Object.values(connectedPeers),
    [connectedPeers]
  )

  const discovered = useMemo(
    () => filterPeers(discoveredAll, searchQuery),
    [discoveredAll, searchQuery]
  )
  const connected = useMemo(
    () => filterPeers(connectedAll, searchQuery),
    [connectedAll, searchQuery]
  )

  return { discovered, connected, searchQuery, setSearchQuery }
}
