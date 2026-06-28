/**
 * Removes `{{placeholder}}` blocks from a prompt body so the cleaned text
 * can be inserted at a user's cursor without leaking template variables.
 *
 * Conservative: preserves leading/trailing whitespace structure, only collapses
 * runs of blank lines that the removal would have left behind.
 */
export function stripPromptTemplate(content: string): string {
  if (!content) return ''
  return content
    .replace(/\{\{[^}]*\}\}/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
