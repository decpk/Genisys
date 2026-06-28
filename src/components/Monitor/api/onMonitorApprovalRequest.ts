import type { MonitorApprovalRequest } from './types'

/**
 * Subscribe to incoming approval requests (a new device wants to view the feed).
 * Returns an unsubscribe function.
 */
export function onMonitorApprovalRequest(
  callback: (payload: MonitorApprovalRequest) => void,
): () => void {
  return window.api.onMonitorApprovalRequest(callback)
}
