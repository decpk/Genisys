import type { Message } from '@/components/Messages/Messages.types'

/** Derives the short preview text shown in an incoming-message notification. */
export function buildMessagePreview(message: Message): string {
  if (message.text && message.text.trim().length > 0) return message.text
  if (message.kind === 'image') return '📷 Photo'
  return 'New message'
}
