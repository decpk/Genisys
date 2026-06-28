import type { MessagesGet, MessagesSet } from '../messages-store.types'

export function setTypingAction(
  get: MessagesGet,
  set: MessagesSet,
  peerId: string,
  isTyping: boolean
): void {
  const { typingByPeer } = get()
  if (typingByPeer[peerId] === isTyping) return
  set({ typingByPeer: { ...typingByPeer, [peerId]: isTyping } })
}
