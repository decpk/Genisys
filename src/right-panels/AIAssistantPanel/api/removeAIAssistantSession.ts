export async function removeAIAssistantSession(
  sessionId: string,
): Promise<void> {
  await window.api.removeAIAssistantSession(sessionId)
}
