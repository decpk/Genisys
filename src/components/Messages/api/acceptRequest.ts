export async function acceptRequest(peerId: string): Promise<void> {
  return window.api.msgAcceptRequest(peerId)
}
