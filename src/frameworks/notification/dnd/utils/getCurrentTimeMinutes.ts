/**
 * Returns the current local time as total minutes since midnight
 * (`0`–`1439`). Used as the reference point for DND range checks.
 */
export function getCurrentTimeMinutes(): number {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}
