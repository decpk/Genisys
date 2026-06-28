import type { MsgPeer } from '@/components/Messages/Messages.types'

import type { MessagesGet, MessagesSet } from '../messages-store.types'

// Merge a peer update into the right bucket and update its status.
//  - connecting/connected -> promote into connectedPeers (the Conversations
//    list) and drop any stale discovery entry.
//  - disconnected -> keep an existing conversation entry but mark it stale.
//  - discovered -> route into discoveredPeers.
export function upsertPeerAction(
  get: MessagesGet,
  set: MessagesSet,
  peer: MsgPeer
): void {
  const { discoveredPeers, connectedPeers } = get()
  const isActive = peer.status === 'connected' || peer.status === 'connecting'

  if (isActive) {
    const nextDiscovered = { ...discoveredPeers }
    delete nextDiscovered[peer.id]
    set({
      connectedPeers: { ...connectedPeers, [peer.id]: peer },
      discoveredPeers: nextDiscovered,
    })
    return
  }

  if (connectedPeers[peer.id]) {
    set({ connectedPeers: { ...connectedPeers, [peer.id]: peer } })
    return
  }

  set({ discoveredPeers: { ...discoveredPeers, [peer.id]: peer } })
}
