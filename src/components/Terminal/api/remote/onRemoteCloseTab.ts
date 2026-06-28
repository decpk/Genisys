/**
 * Subscribe to remote "close tab" requests: an approved device asked to close
 * one of the desktop Terminal app's tabs. The desktop reacts by running its
 * normal `closeTab`. Returns an unsubscribe function.
 */
export function onRemoteCloseTab(
  callback: (payload: { sessionId: string }) => void,
): () => void {
  return window.api.onRemoteCloseTab(callback)
}
