import type { Message, MsgPeer } from '@/components/Messages/Messages.types'

export interface ConversationViewData {
  activePeerId: string | null
  peer: MsgPeer | null
  messages: Message[]
  isPeerTyping: boolean
}
