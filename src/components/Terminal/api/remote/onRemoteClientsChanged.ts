import type { RemoteClient } from './types'

/**
 * Subscribe to changes in the set of connected remote clients. Returns an
 * unsubscribe function.
 */
export function onRemoteClientsChanged(
  callback: (payload: { clients: RemoteClient[] }) => void
): () => void {
  return window.api.onRemoteClientsChanged(callback)
}
