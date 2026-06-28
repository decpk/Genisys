/**
 * Formats a minute count as a compact label such as "45m", "1h", or "1h 20m".
 * Negative or non-finite inputs are clamped to "0m".
 */
export function formatMinutesShort(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) return '0m'
  const rounded = Math.round(minutes)
  const hours = Math.floor(rounded / 60)
  const mins = rounded % 60
  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}
