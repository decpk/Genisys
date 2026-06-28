import type { ThemeScheduleRange } from '../autoThemeScheduler.types'
import { MAX_SCHEDULE_RANGES } from '../autoThemeScheduler.types'
import { parseTimeToMinutes } from './parseTimeToMinutes'
import { hasRangeOverlap } from './hasRangeOverlap'

export function validateRanges(ranges: ThemeScheduleRange[]): string[] {
  const errors: string[] = []
  if (ranges.length > MAX_SCHEDULE_RANGES) {
    errors.push(`Maximum ${MAX_SCHEDULE_RANGES} ranges allowed.`)
  }
  for (let i = 0; i < ranges.length; i++) {
    const r = ranges[i]
    const start = parseTimeToMinutes(r.startTime)
    const end = parseTimeToMinutes(r.endTime)
    if (start < 0 || end < 0) {
      errors.push(`Range ${i + 1}: invalid time format.`)
      continue
    }
    if (start >= end) {
      errors.push(`Range ${i + 1}: start time must be before end time.`)
    }
    if (!r.themeId) {
      errors.push(`Range ${i + 1}: theme must be selected.`)
    }
    for (let j = i + 1; j < ranges.length; j++) {
      if (hasRangeOverlap(r, ranges[j])) {
        errors.push(`Range ${i + 1} overlaps with range ${j + 1}.`)
      }
    }
  }
  return errors
}
