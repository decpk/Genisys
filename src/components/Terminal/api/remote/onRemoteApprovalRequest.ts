import type { RemoteApprovalRequest } from './types'

/**
 * Subscribe to incoming approval requests (a new device wants shell access).
 * Returns an unsubscribe function.
 */
export function onRemoteApprovalRequest(
  callback: (payload: RemoteApprovalRequest) => void
): () => void {
  return window.api.onRemoteApprovalRequest(callback)
}
