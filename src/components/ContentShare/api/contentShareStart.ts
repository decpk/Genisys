import type { ContentShareStatus } from './types'

/** Start the Content Share service (LAN HTTP server + mDNS). Returns status. */
export async function contentShareStart(): Promise<ContentShareStatus> {
  const res = await window.api.contentShareStart()
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to start sharing')
  }
  return res.data
}
