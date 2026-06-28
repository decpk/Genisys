// Group a numeric safety number into blocks of five digits for easy
// out-of-band comparison between two peers.
export function formatSafetyNumber(safetyNumber: string): string {
  const cleaned = safetyNumber.replace(/\s+/g, '')
  const groups = cleaned.match(/.{1,5}/g)
  if (!groups) return cleaned
  return groups.join(' ')
}
