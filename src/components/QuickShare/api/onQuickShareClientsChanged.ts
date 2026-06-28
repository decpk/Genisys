import type { QuickShareClient } from './types'

/** Subscribe to the connected-devices list changing. Returns an unsubscribe fn. */
export function onQuickShareClientsChanged(
  callback: (clients: QuickShareClient[]) => void,
): () => void {
  return window.api.onQuickShareClientsChanged((payload) => callback(payload.clients))
}
