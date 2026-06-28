import { memo } from 'react'
import { Calendar, ExternalLink } from 'lucide-react'

import { IconButton } from '@/components/ui/icon-button'
import type { DPMeeting } from '@/components/DailyPlan/DailyPlan.types'

import { formatCountdown } from '../../utils/formatCountdown'
import { formatTime12h } from '../../utils/formatTime12h'

interface AgendaMeetingRowProps {
  meeting: DPMeeting
  minutesFromNow: number
}

export const AgendaMeetingRow = memo(function AgendaMeetingRow(
  props: AgendaMeetingRowProps
): React.JSX.Element {
  const { meeting, minutesFromNow } = props
  const timeLabel = formatTime12h(meeting.startTime)
  const countdown = formatCountdown(minutesFromNow)
  const link = meeting.meetingLink

  const handleOpen = (): void => {
    if (link) window.open(link, '_blank', 'noopener')
  }

  return (
    <div className="group/row flex items-center gap-2 px-2 py-1 rounded hover:bg-secondary/40 transition-colors">
      <Calendar size={12} className="text-blue-500 shrink-0" />
      <span className="text-xs text-foreground truncate flex-1 min-w-0">{meeting.title}</span>
      {timeLabel && (
        <span className="text-[10px] text-muted-foreground shrink-0">{timeLabel}</span>
      )}
      <span className="text-[10px] font-medium text-blue-500 shrink-0 tabular-nums">
        in {countdown}
      </span>
      {link && (
        <IconButton
          tooltip="Open meeting link"
          tooltipSide="left"
          size="xs"
          variant="ghost"
          onClick={handleOpen}
        >
          <ExternalLink size={11} />
        </IconButton>
      )}
    </div>
  )
})
