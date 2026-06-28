const KEY_VALUE_PATTERN = /^[a-zA-Z_][\w-]*:\s*\S/gm
const LIST_PATTERN = /^\s*-\s+\S/gm
const FORBIDDEN = /[{}<]/

export function isYaml(text: string): boolean {
  const lines = text.split('\n')
  if (lines.length < 2) return false
  if (FORBIDDEN.test(text)) return false

  const keyValueMatches = text.match(KEY_VALUE_PATTERN) ?? []
  const listMatches = text.match(LIST_PATTERN) ?? []

  return keyValueMatches.length + listMatches.length >= 2
}
