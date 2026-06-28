/**
 * Parse an `"HH:mm"` 24-hour time string into total minutes since
 * midnight.
 *
 * Returns `-1` when the input is malformed (missing/invalid hours,
 * minutes, or out-of-range values) so callers can detect bad data
 * without throwing.
 */
export function parseTimeToMinutes(time: string): number {
  if (!time || typeof time !== 'string') return -1
  const parts = time.split(':')
  if (parts.length !== 2) return -1
  const hours = parseInt(parts[0], 10)
  const minutes = parseInt(parts[1], 10)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return -1
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return -1
  return hours * 60 + minutes
}
