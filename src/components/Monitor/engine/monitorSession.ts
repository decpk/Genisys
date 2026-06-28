// Orchestrates a Monitor sharing session end-to-end: it couples the webview
// camera/mic capture (`monitorController`) with the LAN signaling server (the
// `monitor-store`). Kept separate from both so the store stays decoupled from
// media code; the app shell and the Share panel both call these to start/stop.

import { useMonitorStore } from '@/store/monitor-store'

import { monitorController } from './monitorController'

/**
 * Start a session: request camera + mic, then bring up the signaling server.
 * Surfaces capture-permission failures via the store error. If the server fails
 * to start, the camera is released again so nothing is left capturing silently.
 */
export async function startMonitorSession(): Promise<void> {
  const store = useMonitorStore.getState()
  if (store.running || store.busy) return
  store.setError(null)
  try {
    await monitorController.startCapture()
  } catch (err) {
    store.setError(
      err instanceof Error
        ? err.message
        : 'Could not access the camera or microphone.',
    )
    return
  }
  const ok = await useMonitorStore.getState().start()
  if (!ok) monitorController.stopAll()
}

/** Stop a session: shut the server down, then release the camera + mic. */
export async function stopMonitorSession(): Promise<void> {
  await useMonitorStore.getState().stop()
  monitorController.stopAll()
}
