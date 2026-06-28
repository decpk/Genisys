import type { RemoteTerminalStatus } from './types'

/** Fetch the current sharing status (running flag, URL/token, connected clients). */
export async function remoteTerminalStatus(): Promise<RemoteTerminalStatus> {
  const res = await window.api.remoteTerminalStatus()
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to load remote terminal status')
  }
  return res.data
}
