import type { ContentShareStatus } from './types'

/** Current service status: running flag, this device's identity, and peers. */
export async function contentShareStatus(): Promise<ContentShareStatus> {
  const res = await window.api.contentShareStatus()
  if (!res?.success || !res.data) {
    throw new Error(res?.error || 'Failed to read status')
  }
  return res.data
}
