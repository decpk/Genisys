import { memo } from 'react'

import { Checkbox } from '@/components/ui/checkbox'
import type { DPTask } from '@/components/DailyPlan/DailyPlan.types'

import { formatTime12h } from '../../utils/formatTime12h'

interface AgendaTaskRowProps {
  task: DPTask
  onToggle: (task: DPTask) => void
}

export const AgendaTaskRow = memo(function AgendaTaskRow(
  props: AgendaTaskRowProps
): React.JSX.Element {
  const { task, onToggle } = props
  const isComplete = task.status === 'completed'
  const timeLabel = formatTime12h(task.scheduledTime)

  const handleToggle = (): void => onToggle(task)

  const titleClass = isComplete
    ? 'text-[13px] text-muted-foreground line-through truncate flex-1 min-w-0'
    : 'text-[13px] font-medium text-foreground truncate flex-1 min-w-0'

  return (
    <div className="group/row flex items-center gap-2.5 rounded-md px-1 py-1.5 transition-colors hover:bg-secondary/40">
      <Checkbox
        checked={isComplete}
        onCheckedChange={handleToggle}
        aria-label={isComplete ? 'Mark incomplete' : 'Mark complete'}
        className="shrink-0"
      />
      <div className="min-w-0 flex-1">
        <div className={titleClass}>{task.title}</div>
        {timeLabel && <div className="mt-0.5 text-[11px] text-muted-foreground">{timeLabel}</div>}
      </div>
    </div>
  )
})
