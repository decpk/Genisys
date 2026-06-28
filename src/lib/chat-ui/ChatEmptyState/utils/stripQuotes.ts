/** Strip a single pair of surrounding double-quote characters from text. */
export function stripQuotes(text: string): string {
  if (text.startsWith('"') && text.endsWith('"')) return text.slice(1, -1)
  return text
}
