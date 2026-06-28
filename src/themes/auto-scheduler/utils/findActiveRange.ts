import type { ThemeScheduleRange } from '../autoThemeScheduler.types'
import { parseTimeToMinutes } from './parseTimeToMinutes'

export function findActiveRange(ranges: ThemeScheduleRange[], currentMinutes: number): ThemeScheduleRange | null {
  for (const range of ranges) {
    const start = parseTimeToMinutes(range.startTime)
    const end = parseTimeToMinutes(range.endTime)
    if (start < 0 || end < 0 || start >= end) continue
    if (currentMinutes >= start && currentMinutes < end) {
      return range
    }
  }
  return null
}
