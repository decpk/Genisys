import type { MessagesGet, MessagesSet } from '../messages-store.types'

export function removeDiscoveredPeerAction(
  get: MessagesGet,
  set: MessagesSet,
  peerId: string
): void {
  const { discoveredPeers } = get()
  if (!discoveredPeers[peerId]) return
  const next = { ...discoveredPeers }
  delete next[peerId]
  set({ discoveredPeers: next })
}
