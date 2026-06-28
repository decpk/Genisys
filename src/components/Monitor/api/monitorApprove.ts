/**
 * Allow a pending remote connection. Resolves to `false` when the request is no
 * longer pending (e.g. it already timed out) rather than throwing.
 */
export async function monitorApprove(requestId: string): Promise<boolean> {
  const res = await window.api.monitorApprove(requestId)
  return res?.success === true
}
