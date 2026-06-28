import type { ChatMessage } from '../agenticLoop.types'

/** Build the `role: 'tool'` message that carries a tool's textual result. */
export function buildToolResultMessage(toolCallId: string, content: string): ChatMessage {
  return {
    role: 'tool',
    tool_call_id: toolCallId,
    content,
  }
}
