import type { SensitiveMatch } from '../sensitiveData.types'

const PATTERNS: Array<{ regex: RegExp; label: string }> = [
  { regex: /(?:postgres|postgresql):\/\/[^\s]+/gi, label: 'PostgreSQL Connection' },
  { regex: /mongodb(?:\+srv)?:\/\/[^\s]+/gi, label: 'MongoDB Connection' },
  { regex: /mysql:\/\/[^\s]+/gi, label: 'MySQL Connection' },
  { regex: /redis:\/\/[^\s]+/gi, label: 'Redis Connection' },
  { regex: /amqp:\/\/[^\s]+/gi, label: 'AMQP Connection' },
  { regex: /Server\s*=\s*[^;]+;\s*Database\s*=\s*[^;]+;\s*(?:User\s*Id|Uid)\s*=\s*[^;]+/gi, label: 'SQL Server Connection' },
]

export function detectConnectionString(text: string): SensitiveMatch[] {
  const matches: SensitiveMatch[] = []

  for (const { regex, label } of PATTERNS) {
    regex.lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        type: 'connection_string',
        label,
        level: 'critical',
        start: match.index,
        end: match.index + match[0].length,
      })
    }
  }

  return matches
}
