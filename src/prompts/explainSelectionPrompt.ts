/**
 * Builds the prompt for the Explain Selection feature. Produces a structured
 * explanation (meaning, in-depth, examples, how-to-remember) of the user's
 * selected text, localized to the requested language (Hinglish supported).
 */
export function buildExplainPrompt(selectedText: string, language: string): string {
  const languageInstruction = language === 'hinglish'
    ? 'Respond in **Hinglish** — a natural mix of Hindi (written in Devanagari script हिन्दी) and English (written in Latin script). Use Devanagari for Hindi words and Latin for English words. Do NOT use romanized Hindi.'
    : `Respond entirely in **${language}**.`

  return `You are a language and concept explainer. The user selected the following text:

"${selectedText}"

${languageInstruction} Provide the following sections:

## Meaning
A clear, concise meaning of the selected text.

## In-depth Explanation
A detailed explanation with context — what it means, where it's used, and why it matters.

## Examples
2–3 practical usage examples showing how this term/concept is used.

## How to Remember
A mnemonic, analogy, or memory technique so the user never forgets this concept.

Keep the response focused, well-structured, and easy to understand.`
}
