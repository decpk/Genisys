import { useMessagesStore } from '@/store/messages-store'
import { useNavigationStore } from '@/store/navigation-store'

/** Opens the Messages app and selects the given conversation. */
export function openPeerConversation(peerId: string): void {
  useNavigationStore.getState().setActiveApp('messages')
  useMessagesStore.getState().setActivePeer(peerId)
}
