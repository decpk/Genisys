import type { ChatMessage } from '../agenticLoop.types'

/**
 * Build a tool-result message reporting that the requested tool call
 * is blocked by the current AI assistant mode (e.g. trying to call a
 * write tool while the panel is in `plan` or `ask` mode). The text is
 * fed back to the model so it can recover with a final answer or a
 * read-only tool call instead.
 */
export function buildToolBlockedByModeMessage(
  toolCallId: string,
  message: string,
): ChatMessage {
  return {
    role: 'tool',
    tool_call_id: toolCallId,
    content: message,
  }
}
