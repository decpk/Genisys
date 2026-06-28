import type { SensitiveMatch } from '../sensitiveData.types'

const JWT_PATTERN = /eyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g

export function detectJwtToken(text: string): SensitiveMatch[] {
  const matches: SensitiveMatch[] = []
  JWT_PATTERN.lastIndex = 0

  let match: RegExpExecArray | null
  while ((match = JWT_PATTERN.exec(text)) !== null) {
    matches.push({
      type: 'jwt_token',
      label: 'JWT Token',
      level: 'high',
      start: match.index,
      end: match.index + match[0].length,
    })
  }

  return matches
}
