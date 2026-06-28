const JSON_START = /^\s*[{[]/
const JSON_END = /[}\]]\s*$/

export function isJson(text: string): boolean {
  const trimmed = text.trim()
  if (!JSON_START.test(trimmed) || !JSON_END.test(trimmed)) {
    return false
  }
  try {
    JSON.parse(trimmed)
    return true
  } catch {
    return false
  }
}
