import type { MonitorStartInfo } from './types'

/** Start sharing the camera + microphone over the LAN. Returns the QR URL + access info. */
export async function monitorStart(port?: number): Promise<MonitorStartInfo> {
  const res = await window.api.monitorStart(port)
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to start Monitor sharing')
  }
  return res.data
}
