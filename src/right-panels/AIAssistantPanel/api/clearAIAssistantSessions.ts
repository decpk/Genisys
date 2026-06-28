export async function clearAIAssistantSessions(
  appId: string,
  scopeKey?: string,
  exceptSessionId?: string,
): Promise<void> {
  await window.api.clearAIAssistantSessions(appId, scopeKey, exceptSessionId)
}
