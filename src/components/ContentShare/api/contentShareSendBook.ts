import type { SendResult } from './types'

/** Share a whole book with a device. Resolves once the transfer completes (or
 * the receiver declines — `accepted: false`). Throws on network/error. */
export async function contentShareSendBook(deviceId: string, bookId: string): Promise<SendResult> {
  const res = await window.api.contentShareSendBook(deviceId, bookId)
  if (!res?.success) {
    throw new Error(res?.error || 'Failed to send book')
  }
  return { accepted: !!res.accepted }
}
