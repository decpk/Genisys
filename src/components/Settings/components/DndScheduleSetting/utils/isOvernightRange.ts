import { parseTimeToMinutes } from '@/frameworks/notification/dnd'

/**
 * Returns `true` when the range crosses midnight (start time strictly
 * later in the day than end time, e.g. `22:00 → 08:00`).
 *
 * Returns `false` for normal same-day ranges, zero-length ranges, and
 * any input that fails parsing — defensive default that avoids showing
 * a misleading "overnight" hint.
 */
export function isOvernightRange(startTime: string, endTime: string): boolean {
  const start = parseTimeToMinutes(startTime)
  const end = parseTimeToMinutes(endTime)
  if (start < 0 || end < 0) return false
  return start > end
}
