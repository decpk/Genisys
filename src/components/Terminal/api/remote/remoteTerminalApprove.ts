/**
 * Allow a pending remote connection. Resolves to `false` when the request is no
 * longer pending (e.g. it already timed out) rather than throwing.
 */
export async function remoteTerminalApprove(requestId: string): Promise<boolean> {
  const res = await window.api.remoteTerminalApprove(requestId)
  return res?.success === true
}
