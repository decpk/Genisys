export interface AIAssistantSessionMeta {
  id: string
  appId: string
  scopeKey?: string
  conversationId: string
  title: string
  createdAt: string
  updatedAt: string
}

export async function fetchAIAssistantSessions(
  appId: string,
  scopeKey?: string,
): Promise<AIAssistantSessionMeta[]> {
  return (await window.api.loadAIAssistantSessions(appId, scopeKey)) as AIAssistantSessionMeta[]
}
