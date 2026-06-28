import type { ChatMessage } from '../agenticLoop.types'

/** Build a tool-result message reporting that the requested tool name does not exist. */
export function buildUnknownToolMessage(
  toolCallId: string,
  toolName: string,
): ChatMessage {
  return {
    role: 'tool',
    tool_call_id: toolCallId,
    content: `Unknown tool: ${toolName}`,
  }
}
