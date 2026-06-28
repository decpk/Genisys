import type { ContentShareIncoming } from './types'

/** Subscribe to incoming share offers awaiting approval. Returns unsubscribe fn. */
export function onContentShareIncoming(
  callback: (payload: ContentShareIncoming) => void,
): () => void {
  return window.api.onContentShareIncoming(callback)
}
