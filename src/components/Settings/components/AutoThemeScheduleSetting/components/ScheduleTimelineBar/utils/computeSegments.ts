import { THEMES } from '@/themes'
import type { ThemeScheduleRange } from '@/themes/auto-scheduler/autoThemeScheduler.types'
import type { TimelineSegment } from '../ScheduleTimelineBar.types'
import { timeToPercent } from './timeToPercent'

const FALLBACK_COLOR = 'hsl(240 5% 35%)'

function formatTime12h(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const period = h < 12 ? 'AM' : 'PM'
  const display = h === 0 || h === 12 ? 12 : h % 12
  return `${display}:${m.toString().padStart(2, '0')} ${period}`
}

export function computeSegments(ranges: ThemeScheduleRange[]): TimelineSegment[] {
  return ranges.map((range, index) => {
    const theme = THEMES.find((t) => t.id === range.themeId)
    const startPercent = timeToPercent(range.startTime)
    const endPercent = timeToPercent(range.endTime)
    const widthPercent = endPercent - startPercent

    return {
      id: range.id,
      index,
      startPercent,
      widthPercent: widthPercent > 0 ? widthPercent : 0,
      color: theme?.colors.primary ?? FALLBACK_COLOR,
      themeName: theme?.name ?? 'Unknown',
      startLabel: formatTime12h(range.startTime),
      endLabel: formatTime12h(range.endTime),
      isDark: theme?.isDark ?? true,
    }
  })
}
