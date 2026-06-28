/**
 * Deny a pending remote connection. Resolves to `false` when the request is no
 * longer pending rather than throwing.
 */
export async function monitorDeny(requestId: string): Promise<boolean> {
  const res = await window.api.monitorDeny(requestId)
  return res?.success === true
}
