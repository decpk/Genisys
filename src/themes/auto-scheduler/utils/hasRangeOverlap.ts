import type { ThemeScheduleRange } from '../autoThemeScheduler.types'
import { parseTimeToMinutes } from './parseTimeToMinutes'

export function hasRangeOverlap(a: ThemeScheduleRange, b: ThemeScheduleRange): boolean {
  const aStart = parseTimeToMinutes(a.startTime)
  const aEnd = parseTimeToMinutes(a.endTime)
  const bStart = parseTimeToMinutes(b.startTime)
  const bEnd = parseTimeToMinutes(b.endTime)
  if (aStart < 0 || aEnd < 0 || bStart < 0 || bEnd < 0) return false
  return aStart < bEnd && bStart < aEnd
}
