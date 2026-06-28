import { ConversationHeader } from './components/ConversationHeader'
import { EmptyState } from './components/EmptyState'
import { KeyChangedBanner } from './components/KeyChangedBanner'
import { MessageComposer } from './components/MessageComposer'
import { MessageList } from './components/MessageList'
import { conversationViewStyles as s } from './ConversationView.styles'
import { useConversationViewData } from './useConversationViewData'

export function ConversationView(): React.JSX.Element {
  const { activePeerId, peer, messages, isPeerTyping } = useConversationViewData()

  if (!activePeerId || !peer) return <EmptyState />

  let keyChangedBanner: React.JSX.Element | null = null
  if (peer.keyChanged) {
    keyChangedBanner = <KeyChangedBanner peerName={peer.displayName} />
  }

  return (
    <div className={s.root}>
      <ConversationHeader peer={peer} />
      {keyChangedBanner}
      <MessageList messages={messages} isPeerTyping={isPeerTyping} />
      <MessageComposer peerId={peer.id} isConnected={peer.status === 'connected'} />
    </div>
  )
}
