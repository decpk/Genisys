import type { AIMessage, AIToolActivity } from '../AIAssistantPanel.types'
import type { ConversationMessagesPage } from './fetchConversationMessages'

/**
 * Maps a persisted backend chat message into the `AIMessage` shape used by
 * the panel, restoring optional `reasoning` (model chain-of-thought) and
 * `activities` (tool-call history) recorded during the original turn.
 */
export function mapPersistedMessage(
  m: ConversationMessagesPage['messages'][number],
): AIMessage {
  let activities: AIToolActivity[] | undefined
  if (m.activitiesJson) {
    try {
      const parsed = JSON.parse(m.activitiesJson)
      if (Array.isArray(parsed)) activities = parsed as AIToolActivity[]
    } catch {
      // Ignore malformed history — fall back to no activities.
    }
  }
  return {
    id: m.id,
    role: m.role as 'user' | 'assistant',
    content: m.content,
    ...(m.reasoning ? { reasoning: m.reasoning } : {}),
    ...(activities && activities.length > 0 ? { activities } : {}),
  }
}
