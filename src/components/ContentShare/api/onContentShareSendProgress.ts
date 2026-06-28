import type { ContentShareSendProgress } from './types'

/** Subscribe to send progress (waiting → uploading with byte counts). Returns
 * an unsubscribe fn. */
export function onContentShareSendProgress(
  callback: (payload: ContentShareSendProgress) => void,
): () => void {
  return window.api.onContentShareSendProgress(callback)
}
