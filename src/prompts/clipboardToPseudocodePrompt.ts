export function buildToPseudocodePrompt(text: string): { systemPrompt: string; userPrompt: string } {
  return {
    systemPrompt: 'You are a code-to-pseudocode converter. Convert the given code into clean, readable pseudocode. Use simple English, numbered steps where appropriate. Output ONLY the pseudocode, nothing else.',
    userPrompt: text,
  }
}
