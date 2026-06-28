import type { AssistantToolCall, ChatMessage } from '../agenticLoop.types'

/**
 * Coerce a loosely-typed conversation entry (as historically passed by
 * runners) into the strict `ChatMessage` union. This is intentionally
 * permissive: callers often hold legacy message arrays and we don't want
 * to force them through a schema validator just to feed the loop.
 */
export function asChatMessage(entry: unknown): ChatMessage {
  if (entry === null || typeof entry !== 'object') {
    return { role: 'user', content: String(entry ?? '') }
  }

  const record = entry as Record<string, unknown>
  const role = record.role
  const content = record.content

  if (role === 'system') {
    return { role: 'system', content: typeof content === 'string' ? content : '' }
  }

  if (role === 'assistant') {
    let normalisedContent: string | null
    if (typeof content === 'string') normalisedContent = content
    else if (content === null) normalisedContent = null
    else normalisedContent = ''

    const rawToolCalls = record.tool_calls
    if (Array.isArray(rawToolCalls)) {
      return {
        role: 'assistant',
        content: normalisedContent,
        tool_calls: rawToolCalls as AssistantToolCall[],
      }
    }
    return { role: 'assistant', content: normalisedContent }
  }

  if (role === 'tool') {
    return {
      role: 'tool',
      tool_call_id: typeof record.tool_call_id === 'string' ? record.tool_call_id : '',
      content: typeof content === 'string' ? content : '',
    }
  }

  return { role: 'user', content: typeof content === 'string' ? content : '' }
}
