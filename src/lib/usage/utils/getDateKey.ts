/**
 * Returns the LOCAL calendar day for an epoch-ms timestamp as 'YYYY-MM-DD'.
 */
export function getDateKey(ms: number): string {
  const d = new Date(ms)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
