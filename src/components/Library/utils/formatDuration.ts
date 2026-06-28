/**
 * Format a duration in milliseconds as a compact human-readable string.
 *
 * Examples:
 *   formatDuration(0)          // "0s"
 *   formatDuration(45_000)     // "45s"
 *   formatDuration(135_000)    // "2m 15s"
 *   formatDuration(3_720_000)  // "1h 02m"
 *   formatDuration(null)       // ""
 */
export function formatDuration(ms: number | null | undefined): string {
  if (ms == null || !Number.isFinite(ms) || ms < 0) return ''
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, '0')}m`
  }
  if (minutes > 0) {
    return `${minutes}m ${String(seconds).padStart(2, '0')}s`
  }
  return `${seconds}s`
}
