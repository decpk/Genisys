import type { QuickShareStartInfo } from './types'

/** Start QuickShare sharing over the LAN. Returns the QR URL + access info. */
export async function quickShareStart(port?: number): Promise<QuickShareStartInfo> {
  const res = await window.api.quickShareStart(port)
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to start QuickShare')
  }
  return res.data
}
