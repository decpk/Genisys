/**
 * Convert whole minutes back to seconds. Inverse of secondsToMinutes.
 */
export function minutesToSeconds(minutes: number): number {
  if (!Number.isFinite(minutes)) return 0
  return Math.max(0, Math.round(minutes)) * 60
}
