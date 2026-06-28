import type { Message } from '@/components/Messages/Messages.types'

// Revoke every object URL held by a list of messages to release blob memory.
export function revokeMessageUrls(messages: Message[]): void {
  messages.forEach((message) => {
    if (message.imageObjectUrl) {
      URL.revokeObjectURL(message.imageObjectUrl)
    }
  })
}
