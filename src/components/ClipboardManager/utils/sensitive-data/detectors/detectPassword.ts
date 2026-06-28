import type { SensitiveMatch } from '../sensitiveData.types'

const PASSWORD_PATTERNS: Array<{ regex: RegExp; label: string }> = [
  { regex: /(?:password|passwd|pwd)\s*[:=]\s*['"]?[^\s'"]{4,}['"]?/gi, label: 'Password' },
  { regex: /(?:secret|token|auth)\s*[:=]\s*['"]?[^\s'"]{8,}['"]?/gi, label: 'Secret/Token' },
]

export function detectPassword(text: string): SensitiveMatch[] {
  const matches: SensitiveMatch[] = []

  for (const { regex, label } of PASSWORD_PATTERNS) {
    regex.lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        type: 'password',
        label,
        level: 'critical',
        start: match.index,
        end: match.index + match[0].length,
      })
    }
  }

  return matches
}
