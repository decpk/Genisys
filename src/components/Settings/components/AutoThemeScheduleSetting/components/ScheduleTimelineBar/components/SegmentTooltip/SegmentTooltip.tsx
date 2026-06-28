import { memo } from 'react'
import { Clock, Sun, Moon } from 'lucide-react'
import type { SegmentTooltipProps } from './SegmentTooltip.types'

export const SegmentTooltip = memo(function SegmentTooltip({ segment }: SegmentTooltipProps) {
  const ThemeIcon = segment.isDark ? Moon : Sun

  return (
    <div className="flex flex-col gap-1.5 py-0.5 min-w-[140px]">
      <div className="flex items-center gap-2">
        <span
          className="size-2.5 rounded-full shrink-0"
          style={{ backgroundColor: segment.color }}
        />
        <span className="text-xs font-medium">{segment.themeName}</span>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] opacity-70">
        <Clock className="size-3 shrink-0" />
        <span>{segment.startLabel} – {segment.endLabel}</span>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] opacity-70">
        <ThemeIcon className="size-3 shrink-0" />
        <span>{segment.isDark ? 'Dark' : 'Light'} theme</span>
      </div>

      <div className="text-[10px] opacity-50">
        Range {segment.index + 1}
      </div>
    </div>
  )
})
