/**
 * Report back the session id of a tab the desktop Terminal app just created in
 * response to a remote "new tab" request. This unblocks the waiting WebSocket
 * bridge so it can attach the requesting client to the real, locally-visible
 * tab. Pass an empty `sessionId` to signal that tab creation failed (so the
 * bridge stops waiting and tells the client immediately).
 */
export async function remoteTerminalAttachNew(
  requestId: string,
  sessionId: string,
): Promise<void> {
  const res = await window.api.remoteTerminalAttachNew(requestId, sessionId)
  if (!res?.success) {
    throw new Error(res?.error || 'Failed to attach remote terminal tab')
  }
}
