import type { VisualBlock } from '../MessageBubble.types'

export interface InsertVisualButtonProps {
  /** The visual blocks detected in the assistant message. */
  blocks: VisualBlock[]
  /** Inserts the given fenced markdown into the host editor. */
  onInsert: (markdown: string) => void
}
