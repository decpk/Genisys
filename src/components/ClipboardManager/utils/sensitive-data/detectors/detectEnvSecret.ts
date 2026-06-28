import type { SensitiveMatch } from '../sensitiveData.types'

const ENV_SECRET_PATTERN = /^(?:(?:DATABASE_URL|DB_PASSWORD|API_KEY|API_SECRET|SECRET_KEY|AUTH_TOKEN|ACCESS_TOKEN|PRIVATE_KEY|ENCRYPTION_KEY|SIGNING_KEY|MASTER_KEY|APP_SECRET|JWT_SECRET|SESSION_SECRET|OAUTH_SECRET|CLIENT_SECRET)\s*=\s*.+)$/gim

export function detectEnvSecret(text: string): SensitiveMatch[] {
  const matches: SensitiveMatch[] = []
  ENV_SECRET_PATTERN.lastIndex = 0

  let match: RegExpExecArray | null
  while ((match = ENV_SECRET_PATTERN.exec(text)) !== null) {
    matches.push({
      type: 'env_secret',
      label: 'Env Secret',
      level: 'high',
      start: match.index,
      end: match.index + match[0].length,
    })
  }

  return matches
}
