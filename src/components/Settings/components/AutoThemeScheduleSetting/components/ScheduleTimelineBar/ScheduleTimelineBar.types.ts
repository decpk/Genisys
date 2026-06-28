import type { ThemeScheduleRange } from '@/themes/auto-scheduler/autoThemeScheduler.types'

export interface ScheduleTimelineBarProps {
  ranges: ThemeScheduleRange[]
}

export interface TimelineSegment {
  id: string
  index: number
  startPercent: number
  widthPercent: number
  color: string
  themeName: string
  startLabel: string
  endLabel: string
  isDark: boolean
}
