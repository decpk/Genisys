// Group a fingerprint into readable upper-case blocks of four characters.
export function formatFingerprint(fingerprint: string): string {
  const cleaned = fingerprint.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
  const groups = cleaned.match(/.{1,4}/g)
  if (!groups) return cleaned
  return groups.join(' ')
}
