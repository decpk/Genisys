import type { MsgPeer } from '@/components/Messages/Messages.types'

import type { MessagesGet, MessagesSet } from '../messages-store.types'

// A peer seen on the local network. If it is already an established
// conversation we leave the connected entry authoritative.
export function upsertDiscoveredPeerAction(
  get: MessagesGet,
  set: MessagesSet,
  peer: MsgPeer
): void {
  const { discoveredPeers, connectedPeers } = get()
  if (connectedPeers[peer.id]) return
  set({ discoveredPeers: { ...discoveredPeers, [peer.id]: peer } })
}
