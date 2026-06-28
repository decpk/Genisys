import type { DndScheduleRange } from '../dnd.types'
import { parseTimeToMinutes } from './parseTimeToMinutes'
import { isInRange } from './isInRange'

/**
 * Returns `true` if any of the given DND ranges is active at
 * `currentMinutes` (minutes since midnight).
 *
 * Cross-midnight ranges are supported via `isInRange`. Invalid or
 * zero-length ranges are silently ignored.
 */
export function isDndActive(ranges: DndScheduleRange[], currentMinutes: number): boolean {
  if (!ranges || ranges.length === 0) return false
  for (const range of ranges) {
    const start = parseTimeToMinutes(range.startTime)
    const end = parseTimeToMinutes(range.endTime)
    if (isInRange(start, end, currentMinutes)) return true
  }
  return false
}
