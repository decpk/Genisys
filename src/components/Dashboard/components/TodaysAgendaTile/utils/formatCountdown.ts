/**
 * Formats minutes-from-now into a compact countdown string.
 * - 0 or negative → 'now'
 * - <60 → '12m'
 * - <24h → '2h 5m' (omits trailing 0m)
 * - else → '1d+'
 */
export function formatCountdown(minutesFromNow: number): string {
  if (minutesFromNow <= 0) return 'now'
  if (minutesFromNow < 60) return `${minutesFromNow}m`
  if (minutesFromNow < 60 * 24) {
    const h = Math.floor(minutesFromNow / 60)
    const m = minutesFromNow % 60
    return m === 0 ? `${h}h` : `${h}h ${m}m`
  }
  return '1d+'
}
