export function buildClipboardGenerateFromContextSystemPrompt(outputFormat: string): string {
  const formatInstructions: Record<string, string> = {
    text: 'Output plain text.',
    markdown: 'Output well-formatted Markdown with headings, lists, and emphasis.',
    code: 'Output code with appropriate language syntax. Include comments.',
    email: 'Output a professional email with Subject, To (placeholder), and body.',
    json: 'Output valid JSON.',
  }

  return `You are a content generator. The user has clipboard items as context. Use them to fulfill the user's request.

Rules:
- Use the context items to inform your generation — extract relevant details, data, names, code, etc.
- ${formatInstructions[outputFormat] ?? formatInstructions.markdown}
- Be thorough but concise
- Do not include the raw context items in your output — synthesize and transform them
- If the context seems insufficient, do your best with what's available`
}
