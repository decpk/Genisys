/** Resolve a pending incoming transfer (the receiver's Accept/Decline). */
export async function contentShareRespond(transferId: string, accept: boolean): Promise<void> {
  await window.api.contentShareRespond(transferId, accept)
}
