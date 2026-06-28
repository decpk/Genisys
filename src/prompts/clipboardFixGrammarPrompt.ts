export function buildFixGrammarPrompt(text: string): { systemPrompt: string; userPrompt: string } {
  return {
    systemPrompt: 'You are a grammar and spelling correction assistant. Fix all grammar, spelling, and punctuation errors in the given text. Preserve the original meaning, tone, and formatting. Output ONLY the corrected text, nothing else.',
    userPrompt: text,
  }
}
