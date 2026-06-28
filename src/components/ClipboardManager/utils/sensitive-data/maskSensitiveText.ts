import type { SensitiveMatch } from './sensitiveData.types'

export function maskSensitiveText(text: string, matches: SensitiveMatch[]): string {
  if (matches.length === 0) return text

  const sorted = [...matches].sort((a, b) => b.start - a.start)
  let masked = text

  for (const match of sorted) {
    const original = masked.slice(match.start, match.end)
    const visiblePrefix = original.slice(0, Math.min(4, Math.floor(original.length * 0.2)))
    const maskLength = Math.max(original.length - visiblePrefix.length, 4)
    const replacement = visiblePrefix + '•'.repeat(maskLength)
    masked = masked.slice(0, match.start) + replacement + masked.slice(match.end)
  }

  return masked
}
