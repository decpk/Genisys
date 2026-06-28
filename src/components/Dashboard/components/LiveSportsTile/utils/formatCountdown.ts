/**
 * Format a millisecond duration into a compact countdown string.
 * e.g. 150_000 → "2m 30s", 45_000 → "45s"
 */
export function formatCountdown(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`
}
