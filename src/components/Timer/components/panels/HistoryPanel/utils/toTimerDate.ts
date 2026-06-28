/**
 * Coerce a timestamp into a JS Date. Backend may return numeric strings
 * (e.g. "1714742000000") since values are stored as TEXT in SQLite. This
 * util normalizes any of: number, numeric string, ISO string -> Date.
 */
export function toTimerDate(ts: number | string | null | undefined): Date {
  if (ts == null) return new Date(NaN)
  if (typeof ts === 'number') return new Date(ts)
  const trimmed = ts.trim()
  if (trimmed === '') return new Date(NaN)
  // numeric string (epoch ms)
  if (/^-?\d+$/.test(trimmed)) return new Date(Number(trimmed))
  // ISO / RFC date string
  return new Date(trimmed)
}
