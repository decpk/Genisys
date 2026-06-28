/** Returns the supplied date as a local-time YYYY-MM-DD key (matching the
 *  format used by the daily-plan store). */
export function getTodayKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
