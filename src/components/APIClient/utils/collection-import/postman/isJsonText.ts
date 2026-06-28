/**
 * Return true when the given text parses as valid JSON.
 */
export function isJsonText(text: string): boolean {
  const trimmed = text.trim()
  if (!trimmed) return false

  try {
    JSON.parse(trimmed)
    return true
  } catch {
    return false
  }
}
