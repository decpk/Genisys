import type { MessageReaction } from '@/components/Messages/Messages.types'

export interface MessageReactionsProps {
  reactions: MessageReaction[]
  onToggle: (emoji: string) => void
  isOutgoing: boolean
}
