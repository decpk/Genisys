export function detectJson(text: string): boolean {
  const trimmed = text.trim()
  if (trimmed.length < 2) return false

  const startsAsJson = (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))

  if (startsAsJson) {
    try {
      JSON.parse(trimmed)
      return true
    } catch {
      return false
    }
  }

  const yamlPattern = /^[\w-]+:\s*.+/m
  const yamlMultiline = trimmed.split('\n').filter((l) => yamlPattern.test(l)).length
  if (yamlMultiline >= 2) return true

  const tomlPattern = /^\[[\w.-]+\]\s*$/m
  if (tomlPattern.test(trimmed)) return true

  const xmlPattern = /^<\?xml|^<\w+[\s>]/
  if (xmlPattern.test(trimmed) && /<\/\w+>/.test(trimmed)) return true

  return false
}
