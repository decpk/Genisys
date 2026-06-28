import type { MonitorClient } from './types'

/** Subscribe to the connected-viewers list changing. Returns an unsubscribe fn. */
export function onMonitorClientsChanged(
  callback: (clients: MonitorClient[]) => void,
): () => void {
  return window.api.onMonitorClientsChanged((payload) =>
    callback(payload.clients),
  )
}
