import type { RemoteStartInfo } from './types'

/** Start sharing the terminal over the LAN. Returns the QR URL + access info. */
export async function remoteTerminalStart(port?: number): Promise<RemoteStartInfo> {
  const res = await window.api.remoteTerminalStart(port)
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to start remote terminal sharing')
  }
  return res.data
}
