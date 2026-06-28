const UNIX_PATH = /^(\/[\w.-]+){2,}/
const WINDOWS_PATH = /^[A-Z]:\\[\w.-]+/i
const HOME_PATH = /^~\//

export function detectFilePath(text: string): boolean {
  const trimmed = text.trim()
  if (trimmed.includes('\n')) return false
  if (trimmed.length > 500) return false
  return UNIX_PATH.test(trimmed) || WINDOWS_PATH.test(trimmed) || HOME_PATH.test(trimmed)
}
