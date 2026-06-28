import type { SensitiveMatch } from '../sensitiveData.types'

const SSN_PATTERN = /\b(?!000|666|9\d{2})\d{3}-(?!00)\d{2}-(?!0000)\d{4}\b/g

export function detectSsn(text: string): SensitiveMatch[] {
  const matches: SensitiveMatch[] = []
  SSN_PATTERN.lastIndex = 0

  let match: RegExpExecArray | null
  while ((match = SSN_PATTERN.exec(text)) !== null) {
    matches.push({
      type: 'ssn',
      label: 'SSN / Tax ID',
      level: 'critical',
      start: match.index,
      end: match.index + match[0].length,
    })
  }

  return matches
}
