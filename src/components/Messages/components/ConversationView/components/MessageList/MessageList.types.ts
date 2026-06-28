import type { RefObject } from 'react'

import type { Message } from '@/components/Messages/Messages.types'

export interface MessageListProps {
  messages: Message[]
  isPeerTyping: boolean
}

export interface MessageListData {
  rootRef: RefObject<HTMLDivElement | null>
  bottomRef: RefObject<HTMLDivElement | null>
  handleScroll: () => void
  handleMediaLoad: () => void
}
