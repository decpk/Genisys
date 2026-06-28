import { memo, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Tooltip } from '@/components/Tooltip'
import type { ScheduleTimelineBarProps } from './ScheduleTimelineBar.types'
import { STYLES } from './ScheduleTimelineBar.styles'
import { computeSegments } from './utils/computeSegments'
import { formatHourLabel } from './utils/formatHourLabel'
import { SegmentTooltip } from './components/SegmentTooltip'

const HOUR_MARKERS = [
  { hour: 0, position: '0%' },
  { hour: 6, position: '25%' },
  { hour: 12, position: '50%' },
  { hour: 18, position: '75%' },
  { hour: 0, position: '100%' },
]

export const ScheduleTimelineBar = memo(function ScheduleTimelineBar({ ranges }: ScheduleTimelineBarProps) {
  const segments = useMemo(() => computeSegments(ranges), [ranges])

  return (
    <div>
      <div className={cn(STYLES.container)}>
        {segments.map((segment) => (
          <div
            key={segment.id}
            className="absolute top-0 bottom-0 [&>span]:w-full [&>span]:h-full"
            style={{
              left: `${segment.startPercent}%`,
              width: `${segment.widthPercent}%`,
            }}
          >
            <Tooltip
              side="top"
              content={<SegmentTooltip segment={segment} />}
            >
              <div
                className="w-full h-full rounded-sm transition-all duration-200 opacity-70 hover:opacity-100 cursor-default border border-black/10 dark:border-white/10"
                style={{ backgroundColor: segment.color }}
              />
            </Tooltip>
          </div>
        ))}
      </div>

      <div className={cn(STYLES.labelsRow)}>
        {HOUR_MARKERS.map((marker, i) => (
          <span key={i} className={cn(STYLES.hourLabel)}>
            {formatHourLabel(marker.hour)}
          </span>
        ))}
      </div>
    </div>
  )
})
