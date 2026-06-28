import type { ThemeScheduleRange } from '@/themes/auto-scheduler/autoThemeScheduler.types'
import { findActiveRange, getCurrentTimeMinutes } from '@/themes/auto-scheduler'
import { formatTime } from '@/components/DailyPlan/utils/formatTime'

interface ScheduleStatus {
  label: string
  variant: 'active' | 'paused' | 'inactive'
}

export function getScheduleStatus(enabled: boolean, ranges: ThemeScheduleRange[], themeName: string | undefined): ScheduleStatus {
  if (!enabled) {
    return { label: 'Auto theme is paused', variant: 'paused' }
  }

  if (ranges.length === 0) {
    return { label: 'No ranges configured', variant: 'inactive' }
  }

  const currentMinutes = getCurrentTimeMinutes()
  const activeRange = findActiveRange(ranges, currentMinutes)

  if (!activeRange) {
    return { label: 'Outside scheduled ranges', variant: 'inactive' }
  }

  const name = themeName ?? activeRange.themeId
  const endFormatted = formatTime(activeRange.endTime)
  return { label: `Active: ${name} until ${endFormatted}`, variant: 'active' }
}
