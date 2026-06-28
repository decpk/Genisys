/**
 * True when `prefix` is a strict word-prefix of `full` (both normalized,
 * space-separated chord strings). e.g. "mod+k" is a prefix of "mod+k w".
 */
export function isChordPrefix(prefix: string, full: string): boolean {
  if (!prefix || !full || prefix === full) return false
  const prefixParts = prefix.split(' ')
  const fullParts = full.split(' ')
  if (prefixParts.length >= fullParts.length) return false
  for (let i = 0; i < prefixParts.length; i++) {
    if (prefixParts[i] !== fullParts[i]) return false
  }
  return true
}
