import type { ContentSharePeer } from './types'

/** List Genisys devices currently discovered on the LAN. */
export async function contentShareListDevices(): Promise<ContentSharePeer[]> {
  const res = await window.api.contentShareListDevices()
  if (!res?.success) {
    throw new Error(res?.error || 'Failed to list devices')
  }
  return res.data ?? []
}
