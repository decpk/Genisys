import { busyListeners } from './registryState'

/**
 * Subscribe to busy-state changes. Returns an unsubscribe function.
 *
 * Lets the keep-alive eviction logic re-evaluate when an app finishes its
 * task (becomes idle) so it can be evicted without waiting for the next
 * app switch.
 */
export function subscribeAppBusy(listener: () => void): () => void {
  busyListeners.add(listener)
  return () => {
    busyListeners.delete(listener)
  }
}
