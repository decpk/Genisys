import type { MessagesGet, MessagesSet } from '../messages-store.types'

// Sets (or clears) the disappearing-message TTL for a peer's conversation.
// A ttl of 0 disables disappearing messages. New messages stamped with an
// expiry are handled in appendMessage; existing messages are unaffected.
export function setEphemeralTtlAction(
  get: MessagesGet,
  set: MessagesSet,
  peerId: string,
  ttlMs: number
): void {
  const { ephemeralTtlByPeer } = get()
  const next = { ...ephemeralTtlByPeer }
  if (ttlMs > 0) {
    next[peerId] = ttlMs
  } else {
    delete next[peerId]
  }
  set({ ephemeralTtlByPeer: next })
}
