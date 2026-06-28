export function buildExplainCodePrompt(text: string): { systemPrompt: string; userPrompt: string } {
  return {
    systemPrompt: 'You are a code explanation assistant. Explain the given code in plain English. Cover what it does, how it works, and any important details. Be concise but thorough. Use markdown formatting.',
    userPrompt: text,
  }
}
