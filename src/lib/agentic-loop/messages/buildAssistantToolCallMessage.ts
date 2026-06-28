import type { AssistantToolCall, ChatMessage, RawToolCall } from '../agenticLoop.types'

/**
 * Build the assistant message that carries the model's tool-call request.
 * The OpenAI multi-turn protocol requires this exact shape (with `null`
 * content when the assistant only emitted tool calls).
 */
export function buildAssistantToolCallMessage(
  content: string,
  toolCalls: RawToolCall[],
): ChatMessage {
  const tcValues: AssistantToolCall[] = toolCalls.map((tc) => ({
    id: tc.id,
    type: 'function',
    function: { name: tc.name, arguments: tc.arguments },
  }))

  const safeContent = content.length > 0 ? content : null

  return {
    role: 'assistant',
    content: safeContent,
    tool_calls: tcValues,
  }
}
