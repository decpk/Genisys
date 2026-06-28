import type { AIAssistantSessionMeta } from './fetchAIAssistantSessions'

export async function saveAIAssistantSession(
  session: AIAssistantSessionMeta,
): Promise<void> {
  await window.api.saveAIAssistantSession(session)
}
