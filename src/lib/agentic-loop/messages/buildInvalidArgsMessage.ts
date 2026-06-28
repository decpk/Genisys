import type { ChatMessage } from '../agenticLoop.types'

/**
 * Build a tool-result message reporting that the model's `arguments` JSON
 * blob could not be parsed.
 */
export function buildInvalidArgsMessage(
  toolCallId: string,
  rawArguments: string,
  reason: string,
): ChatMessage {
  return {
    role: 'tool',
    tool_call_id: toolCallId,
    content: `Invalid JSON arguments (${reason}): ${rawArguments}`,
  }
}
