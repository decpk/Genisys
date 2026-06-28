export async function fetchAITransform(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const result = await window.api.llmJsonCompletion({
    systemPrompt,
    userPrompt,
  })

  if (result.success && result.content) {
    return result.content.trim()
  }

  throw new Error(result.error || 'AI transformation failed')
}
