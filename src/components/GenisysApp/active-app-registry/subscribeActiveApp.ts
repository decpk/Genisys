import { activeAppListeners } from './activeAppState'

/** Subscribe to active-app changes. Returns an unsubscribe function. */
export function subscribeActiveApp(listener: () => void): () => void {
  activeAppListeners.add(listener)
  return () => {
    activeAppListeners.delete(listener)
  }
}
