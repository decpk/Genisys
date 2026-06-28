/** Returns an ISO timestamp randomly offset up to `daysBack` days in the past. */
export function randomDateIso(daysBack = 365): string {
  const now = Date.now()
  const offsetMs = Math.floor(Math.random() * daysBack * 24 * 60 * 60 * 1000)
  return new Date(now - offsetMs).toISOString()
}
