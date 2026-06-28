import { busyApps } from './registryState'

/** Whether the given app is currently reporting a running task. */
export function isAppBusy(appId: string): boolean {
  return busyApps.get(appId) ?? false
}
