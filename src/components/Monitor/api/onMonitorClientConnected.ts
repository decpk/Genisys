/**
 * Subscribe to "a viewer is ready" events. The desktop should create a peer
 * connection for `clientId`, add its camera + mic tracks, and send an offer.
 * Returns an unsubscribe function.
 */
export function onMonitorClientConnected(
  callback: (payload: { clientId: string; ip: string }) => void,
): () => void {
  return window.api.onMonitorClientConnected(callback)
}
