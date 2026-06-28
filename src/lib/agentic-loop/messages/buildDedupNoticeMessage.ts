import type { ChatMessage } from '../agenticLoop.types'

/**
 * Build the synthetic tool-result message we inject when the model tries
 * to call the same tool with the same arguments more than the configured
 * limit. The wording nudges the model toward producing a final answer
 * instead of looping forever.
 */
export function buildDedupNoticeMessage(
  toolCallId: string,
  toolName: string,
): ChatMessage {
  const content =
    `You have already called \`${toolName}\` with these exact arguments. ` +
    `Re-read the previous tool result instead of repeating the call. ` +
    `If you have enough information, produce the final answer now.`

  return {
    role: 'tool',
    tool_call_id: toolCallId,
    content,
  }
}
