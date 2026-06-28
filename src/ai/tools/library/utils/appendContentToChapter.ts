/** Append text to the end of chapter content with a blank-line separator. */
export function appendContentToChapter(content: string, text: string): string {
  const base = content.trimEnd()
  if (base.length === 0) return text.trimEnd() + '\n'
  return base + '\n\n' + text.trimEnd() + '\n'
}
