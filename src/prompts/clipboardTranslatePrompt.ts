export function buildTranslatePrompt(text: string, targetLanguage: string): { systemPrompt: string; userPrompt: string } {
  return {
    systemPrompt: `You are a professional translator. Translate the given text to ${targetLanguage}. Preserve formatting, tone, and meaning. Output ONLY the translated text, nothing else.`,
    userPrompt: text,
  }
}
