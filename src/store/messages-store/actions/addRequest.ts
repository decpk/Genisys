import type { MsgRequest } from '@/components/Messages/Messages.types'

import type { MessagesGet, MessagesSet } from '../messages-store.types'

// Record an inbound chat request awaiting the user's decision. Ignores a peer
// that is already connected (no need to re-prompt for an active conversation).
export function addRequestAction(
  get: MessagesGet,
  set: MessagesSet,
  request: MsgRequest
): void {
  const { incomingRequests, connectedPeers } = get()
  if (connectedPeers[request.peerId]?.status === 'connected') return
  set({
    incomingRequests: { ...incomingRequests, [request.peerId]: request },
  })
}
