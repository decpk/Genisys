import { useEffect } from 'react'
import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('messages')

import { envelopeToMessage } from '@/components/Messages/utils/envelopeToMessage'
import { notifyIncomingMessage } from '@/components/Messages/utils/notifications'
import { getEffectiveActiveApp } from '@/frameworks/keyboard-shortcut/scopeOverride'
import { isWindowFocused } from '@/hooks/useWindowFocus'
import { useMessagesStore } from '@/store/messages-store'

// Wire every Messages bridge event into the store and tear them down on
// unmount. Each window.api.onMsg* call returns a synchronous unlisten fn.
export function useMessagesSubscriptions(): void {
  const upsertDiscoveredPeer = useMessagesStore((s) => s.upsertDiscoveredPeer)
  const removeDiscoveredPeer = useMessagesStore((s) => s.removeDiscoveredPeer)
  const upsertPeer = useMessagesStore((s) => s.upsertPeer)
  const addRequest = useMessagesStore((s) => s.addRequest)
  const removeRequest = useMessagesStore((s) => s.removeRequest)
  const appendMessage = useMessagesStore((s) => s.appendMessage)
  const setTyping = useMessagesStore((s) => s.setTyping)

  useEffect(() => {
    const unsubscribers = [
      window.api.onMsgPeerDiscovered((peer) => upsertDiscoveredPeer(peer)),
      window.api.onMsgPeerLost((data) => removeDiscoveredPeer(data.peerId)),
      window.api.onMsgPeerUpdated((peer) => upsertPeer(peer)),
      window.api.onMsgRequest((request) => {
        addRequest(request)
        toast.info(`${request.displayName} wants to chat`)
      }),
      window.api.onMsgRequestResolved((data) => removeRequest(data.peerId)),
      window.api.onMsgMessage((envelope) => {
        const message = envelopeToMessage(envelope)
        appendMessage(envelope.peerId, message)
        if (message.direction !== 'incoming') return
        const { activePeerId, connectedPeers } = useMessagesStore.getState()
        // Suppress only when the user is actively viewing this exact
        // conversation: Messages is the active app AND the window is focused
        // AND it's the currently-open peer. Otherwise notify — as an in-app
        // toast when Genisys is focused, or a native OS notification when it's
        // backgrounded (a toast would be invisible behind other apps).
        const windowFocused = isWindowFocused()
        const viewingThisConversation =
          windowFocused &&
          getEffectiveActiveApp() === 'messages' &&
          envelope.peerId === activePeerId
        if (!viewingThisConversation) {
          notifyIncomingMessage(message, connectedPeers[envelope.peerId], windowFocused)
        }
      }),
      window.api.onMsgTyping((data) => setTyping(data.peerId, data.isTyping)),
      window.api.onMsgError((data) => {
        console.error('[messages] peer error:', data.peerId, data.error)
        toast.error(data.error)
      }),
    ]

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe())
    }
  }, [
    upsertDiscoveredPeer,
    removeDiscoveredPeer,
    upsertPeer,
    addRequest,
    removeRequest,
    appendMessage,
    setTyping,
  ])
}
