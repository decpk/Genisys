import type { DailyDigest } from './digest.types'

export function formatDigestSummary(digest: DailyDigest): string {
  if (digest.totalItems === 0) return 'No clipboard activity recorded.'

  const parts: string[] = []

  const sessionLabel = digest.sessionCount === 1 ? '1 session' : `${digest.sessionCount} sessions`
  parts.push(`${digest.totalItems} items across ${sessionLabel}.`)

  const typeParts: string[] = []
  if (digest.textCount > 0) typeParts.push(`${digest.textCount} text`)
  if (digest.imageCount > 0) typeParts.push(`${digest.imageCount} image`)
  if (typeParts.length > 0) {
    parts.push(`Copied ${typeParts.join(', ')}.`)
  }

  if (digest.categories.length > 0) {
    const topCategories = digest.categories
      .slice(0, 3)
      .map((c) => `${c.count} ${c.key}`)
      .join(', ')
    parts.push(`Top types: ${topCategories}.`)
  }

  if (digest.peakHourCount > 0) {
    const period = digest.peakHour >= 12 ? 'PM' : 'AM'
    const h12 = digest.peakHour === 0 ? 12 : digest.peakHour > 12 ? digest.peakHour - 12 : digest.peakHour
    parts.push(`Peak activity: ${h12} ${period} (${digest.peakHourCount} items).`)
  }

  if (digest.sensitiveCount > 0) {
    const label = digest.sensitiveCount === 1 ? '1 item' : `${digest.sensitiveCount} items`
    parts.push(`${label} flagged as sensitive.`)
  }

  return parts.join(' ')
}
