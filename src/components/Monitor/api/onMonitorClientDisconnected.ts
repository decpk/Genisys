/**
 * Subscribe to "a viewer disconnected" events. The desktop should close and drop
 * that client's peer connection. Returns an unsubscribe function.
 */
export function onMonitorClientDisconnected(
  callback: (payload: { clientId: string }) => void,
): () => void {
  return window.api.onMonitorClientDisconnected(callback)
}
