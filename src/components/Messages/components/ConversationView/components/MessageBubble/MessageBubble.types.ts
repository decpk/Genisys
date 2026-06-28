import type { Message } from '@/components/Messages/Messages.types'

export interface MessageBubbleProps {
  message: Message
  onImageLoad?: () => void
}
