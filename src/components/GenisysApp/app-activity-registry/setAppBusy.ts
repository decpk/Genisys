import { busyApps, busyListeners } from './registryState'

/**
 * Report whether an app is currently busy (running a task that must not be
 * interrupted by keep-alive eviction).
 *
 * No-ops for empty ids (e.g. a panel rendered outside an `AppShell`) and when
 * the value is unchanged. Notifies subscribers on every real change.
 */
export function setAppBusy(appId: string | null | undefined, busy: boolean): void {
  if (!appId) return

  const current = busyApps.get(appId) ?? false
  if (current === busy) return

  if (busy) {
    busyApps.set(appId, true)
  } else {
    busyApps.delete(appId)
  }

  for (const listener of busyListeners) listener()
}
