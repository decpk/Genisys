import type { MonitorSignal, MonitorSignalEvent } from './types'

/**
 * Subscribe to WebRTC signaling from viewers (answer / ICE candidate), tagged
 * with the originating client id. Returns an unsubscribe function.
 */
export function onMonitorSignal(
  callback: (payload: MonitorSignalEvent) => void,
): () => void {
  return window.api.onMonitorSignal((payload) =>
    callback({ clientId: payload.clientId, data: payload.data as MonitorSignal }),
  )
}
