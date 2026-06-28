/**
 * Auto-detect Monaco editor language from content string.
 */
export function detectLanguage(content: string): string {
  const trimmed = content.trimStart()
  if (!trimmed) return 'plaintext'

  // JSON: starts with { or [
  if (trimmed[0] === '{' || trimmed[0] === '[') {
    try {
      JSON.parse(trimmed)
      return 'json'
    } catch {
      // Could be partial/invalid JSON — still highlight as JSON
      return 'json'
    }
  }

  // XML/HTML: starts with <
  if (trimmed[0] === '<') {
    if (/^<\?xml/i.test(trimmed) || /^<[a-z]/i.test(trimmed)) {
      return 'xml'
    }
    if (/^<!DOCTYPE\s+html/i.test(trimmed) || /^<html/i.test(trimmed)) {
      return 'html'
    }
    return 'xml'
  }

  return 'plaintext'
}
