import type { MonitorStatus } from './types'

/** Fetch the current sharing status (running flag, URL/token, connected viewers). */
export async function monitorStatus(): Promise<MonitorStatus> {
  const res = await window.api.monitorStatus()
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to load Monitor status')
  }
  return res.data
}
