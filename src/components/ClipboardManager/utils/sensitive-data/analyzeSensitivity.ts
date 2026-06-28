import type { SensitivityResult, SensitivityLevel, SensitiveMatch } from './sensitiveData.types'
import { detectApiKey } from './detectors/detectApiKey'
import { detectPrivateKey } from './detectors/detectPrivateKey'
import { detectJwtToken } from './detectors/detectJwtToken'
import { detectPassword } from './detectors/detectPassword'
import { detectCreditCard } from './detectors/detectCreditCard'
import { detectSsn } from './detectors/detectSsn'
import { detectConnectionString } from './detectors/detectConnectionString'
import { detectAwsCredential } from './detectors/detectAwsCredential'
import { detectEnvSecret } from './detectors/detectEnvSecret'

type DetectorFn = (text: string) => SensitiveMatch[]

const DETECTORS: DetectorFn[] = [
  detectApiKey,
  detectPrivateKey,
  detectJwtToken,
  detectPassword,
  detectCreditCard,
  detectSsn,
  detectConnectionString,
  detectAwsCredential,
  detectEnvSecret,
]

const LEVEL_PRIORITY: Record<SensitivityLevel, number> = {
  none: 0,
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
}

export function analyzeSensitivity(text: string): SensitivityResult {
  if (!text || text.trim().length === 0) {
    return { level: 'none', matches: [] }
  }

  const allMatches: SensitiveMatch[] = []

  for (const detect of DETECTORS) {
    const matches = detect(text)
    allMatches.push(...matches)
  }

  if (allMatches.length === 0) {
    return { level: 'none', matches: [] }
  }

  let highestLevel: SensitivityLevel = 'low'
  for (const match of allMatches) {
    if (LEVEL_PRIORITY[match.level] > LEVEL_PRIORITY[highestLevel]) {
      highestLevel = match.level
    }
  }

  return { level: highestLevel, matches: allMatches }
}
