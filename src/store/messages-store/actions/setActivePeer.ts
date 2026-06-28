import type { MessagesGet, MessagesSet } from '../messages-store.types'

export function setActivePeerAction(
  get: MessagesGet,
  set: MessagesSet,
  peerId: string | null
): void {
  if (peerId && get().unreadByPeer[peerId]) {
    const { unreadByPeer } = get()
    set({ activePeerId: peerId, unreadByPeer: { ...unreadByPeer, [peerId]: 0 } })
    return
  }
  set({ activePeerId: peerId })
}
