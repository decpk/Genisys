import type { MsgPeer } from '@/components/Messages/Messages.types'

// Case-insensitive filter of peers by display name or "host:port". An empty
// query returns the same array reference to keep memoization cheap.
export function filterPeers(peers: MsgPeer[], query: string): MsgPeer[] {
  const q = query.trim().toLowerCase()
  if (!q) return peers
  return peers.filter((peer) => {
    const name = peer.displayName.toLowerCase()
    const address = `${peer.host}:${peer.port}`.toLowerCase()
    return name.includes(q) || address.includes(q)
  })
}
