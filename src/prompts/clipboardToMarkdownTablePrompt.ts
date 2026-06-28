export function buildToMarkdownTablePrompt(text: string): { systemPrompt: string; userPrompt: string } {
  return {
    systemPrompt: 'You are a data formatting assistant. Convert the given data (CSV, TSV, or any tabular data) into a well-formatted markdown table. Output ONLY the markdown table, nothing else.',
    userPrompt: text,
  }
}
