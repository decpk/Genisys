export function buildSummarizePrompt(text: string): { systemPrompt: string; userPrompt: string } {
  return {
    systemPrompt: 'You are a concise summarizer. Summarize the given text into key bullet points. Output ONLY the summary, no preamble or explanation. Use markdown bullet points.',
    userPrompt: text,
  }
}
