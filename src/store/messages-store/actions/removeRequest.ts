import type { MessagesGet, MessagesSet } from '../messages-store.types'

// Drop a chat request once it has been accepted, rejected, or resolved.
export function removeRequestAction(
  get: MessagesGet,
  set: MessagesSet,
  peerId: string
): void {
  const { incomingRequests } = get()
  if (!incomingRequests[peerId]) return
  const next = { ...incomingRequests }
  delete next[peerId]
  set({ incomingRequests: next })
}
