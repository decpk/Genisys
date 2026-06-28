import type { Message } from '@/components/Messages/Messages.types'

// Derive a one-line preview string for a conversation row. Image messages
// collapse to "Photo"; the caller truncates text via CSS.
export function getMessagePreview(message: Message): string {
  if (message.kind === 'image') return 'Photo'
  return message.text ?? ''
}
