import type { SensitiveMatch } from '../sensitiveData.types'

const AWS_ACCESS_KEY = /\bAKIA[A-Z0-9]{16}\b/g
const AWS_SECRET_KEY = /(?:aws_secret_access_key|AWS_SECRET_ACCESS_KEY)\s*[:=]\s*['"]?[A-Za-z0-9/+=]{40}['"]?/g

export function detectAwsCredential(text: string): SensitiveMatch[] {
  const matches: SensitiveMatch[] = []

  AWS_ACCESS_KEY.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = AWS_ACCESS_KEY.exec(text)) !== null) {
    matches.push({
      type: 'aws_credential',
      label: 'AWS Access Key',
      level: 'critical',
      start: match.index,
      end: match.index + match[0].length,
    })
  }

  AWS_SECRET_KEY.lastIndex = 0
  while ((match = AWS_SECRET_KEY.exec(text)) !== null) {
    matches.push({
      type: 'aws_credential',
      label: 'AWS Secret Key',
      level: 'critical',
      start: match.index,
      end: match.index + match[0].length,
    })
  }

  return matches
}
