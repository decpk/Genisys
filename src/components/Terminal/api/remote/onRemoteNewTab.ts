/**
 * Subscribe to remote "new tab" requests: an approved device asked to open a new
 * tab. The desktop reacts by running its normal `createTab` (so the tab is a
 * real, locally-visible Terminal app tab) and then reports the created session id
 * back via `remoteTerminalAttachNew`, so the requesting client can attach to it.
 * Returns an unsubscribe function.
 */
export function onRemoteNewTab(
  callback: (payload: { requestId: string; cols: number; rows: number }) => void,
): () => void {
  return window.api.onRemoteNewTab(callback)
}
