/**
 * Formats a `YYYY-MM-DD` date key as a short human label such as "Apr 12".
 * Falls back to the raw string if parsing fails.
 */
const SHORT_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

export function formatHighlightDateLabel(dateKey: string): string {
  const parts = dateKey.split('-')
  if (parts.length !== 3) return dateKey
  const monthIdx = Number(parts[1]) - 1
  const day = Number(parts[2])
  if (monthIdx < 0 || monthIdx > 11 || !Number.isFinite(day)) return dateKey
  return `${SHORT_MONTHS[monthIdx]} ${day}`
}
