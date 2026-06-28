import type { MessagesSet } from '../messages-store.types'

/**
 * Drop every discovered (but not connected) peer. Used when the user goes
 * invisible: the backend stops browsing and clears its own map, so the UI
 * should no longer show LAN-discovered peers.
 */
export function clearDiscoveredPeersAction(set: MessagesSet): void {
  set({ discoveredPeers: {} })
}
