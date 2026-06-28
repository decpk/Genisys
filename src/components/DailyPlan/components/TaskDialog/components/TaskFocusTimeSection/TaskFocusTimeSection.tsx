import { Timer as TimerIcon } from 'lucide-react'

import type { TaskFocusTimeSectionProps } from './TaskFocusTimeSection.types'
import { useTaskFocusTimeSectionData } from './useTaskFocusTimeSectionData'
import { formatFocusMinutes } from './utils/formatFocusMinutes'

export function TaskFocusTimeSection(
  props: TaskFocusTimeSectionProps,
): React.JSX.Element {
  const { dailyPlanTaskId } = props
  const { isLoading, totalMinutes, sessionCount } =
    useTaskFocusTimeSectionData(dailyPlanTaskId)

  let body: React.ReactNode = null
  if (isLoading) {
    body = <span className="text-muted-foreground">Loading…</span>
  } else {
    body = (
      <span>
        Focus time: <span className="font-medium text-foreground">{formatFocusMinutes(totalMinutes)}</span>{' '}
        <span className="text-muted-foreground">({sessionCount} sessions)</span>
      </span>
    )
  }

  return (
    <div className="flex items-center gap-2 rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-xs">
      <TimerIcon size={14} className="text-muted-foreground shrink-0" />
      {body}
    </div>
  )
}
