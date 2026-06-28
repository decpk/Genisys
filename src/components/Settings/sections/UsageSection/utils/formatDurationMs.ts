/**
 * Formats a duration in milliseconds into a compact human string,
 * e.g. `2h 14m`, `37m`, `< 1m`, `0m`.
 */
export function formatDurationMs(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return '0m'

  const totalMinutes = Math.floor(ms / 60000)
  if (totalMinutes < 1) return '< 1m'

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours <= 0) return `${minutes}m`
  if (minutes <= 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}
