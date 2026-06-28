import type { ContentShareReceived } from './types'

/** Subscribe to bundles finished importing on this device. Returns unsubscribe fn. */
export function onContentShareReceived(
  callback: (payload: ContentShareReceived) => void,
): () => void {
  return window.api.onContentShareReceived(callback)
}
