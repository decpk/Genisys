/** Returns the LOCAL hour (0-23) for an epoch-ms timestamp. */
export function getHour(ms: number): number {
  return new Date(ms).getHours()
}
