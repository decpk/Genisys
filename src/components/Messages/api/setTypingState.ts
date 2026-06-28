export async function setTypingState(
  peerId: string,
  isTyping: boolean
): Promise<void> {
  return window.api.msgSetTyping(peerId, isTyping)
}
