import type { SensitiveMatch } from '../sensitiveData.types'

const PRIVATE_KEY_PATTERN = /-----BEGIN\s+(RSA|DSA|EC|OPENSSH|PGP|ENCRYPTED)?\s*PRIVATE KEY-----/g

export function detectPrivateKey(text: string): SensitiveMatch[] {
  const matches: SensitiveMatch[] = []
  PRIVATE_KEY_PATTERN.lastIndex = 0

  let match: RegExpExecArray | null
  while ((match = PRIVATE_KEY_PATTERN.exec(text)) !== null) {
    matches.push({
      type: 'private_key',
      label: 'Private Key',
      level: 'critical',
      start: match.index,
      end: match.index + match[0].length,
    })
  }

  return matches
}
