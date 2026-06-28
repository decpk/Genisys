import { busyApps } from './registryState'

/** Snapshot of all app ids currently reporting a running task. */
export function getBusyApps(): string[] {
  return Array.from(busyApps.keys())
}
