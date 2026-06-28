/**
 * Convert seconds to whole minutes by rounding to the nearest minute.
 * Used by stepper inputs that operate in minutes.
 */
export function secondsToMinutes(seconds: number): number {
  if (!Number.isFinite(seconds)) return 0
  return Math.round(seconds / 60)
}
