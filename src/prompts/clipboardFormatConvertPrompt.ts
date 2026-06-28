export function buildFormatConvertPrompt(text: string, from: string, to: string): { systemPrompt: string; userPrompt: string } {
  return {
    systemPrompt: `You are a data format converter. Convert the given ${from} to valid ${to}. Output ONLY the converted ${to}, nothing else. No explanation, no code fences.`,
    userPrompt: text,
  }
}
