export async function rejectRequest(peerId: string): Promise<void> {
  return window.api.msgRejectRequest(peerId)
}
