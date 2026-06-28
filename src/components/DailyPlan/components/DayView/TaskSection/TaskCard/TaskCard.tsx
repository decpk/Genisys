import { AlertTriangle, Clock } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { LinkifiedText } from '@/components/LinkifiedText'
import { TaskDescription } from '../../../TaskDescription'
import { TaskContextMenu, TaskDropdownMenu } from '../../TaskContextMenu'
import { PriorityDot } from '../../shared/priority'
import { useTaskCardData } from './useTaskCardData'
import { taskCardStyles as s } from './TaskCard.styles'
import type { TaskCardProps } from './TaskCard.types'

export function TaskCard(props: TaskCardProps): React.JSX.Element {
  const { task, onEdit } = props
  const data = useTaskCardData({ task, onEdit })

  const showStatusPill = data.statusLabel !== null && data.statusPillClass !== null
  const showTimeBlock = data.hasTime && data.timeRangeText !== null
  const showDescription = !!task.description
  const cardClass = cn(s.card, data.isCompleted && s.cardCompleted)
  const titleClass = cn(s.cardTitle, data.isCompleted && s.titleCompleted)
  const statusPillClass = cn(s.statusPill, data.statusPillClass ?? undefined)

  return (
    <TaskContextMenu task={task} onEdit={onEdit}>
      <div onDoubleClick={data.handleDoubleClick} className={cardClass}>
        <div className={s.cardInner}>
          <TaskDropdownMenu task={task} onEdit={onEdit} className={s.menuButton} />

          <div className={s.cardRow}>
            <Checkbox
              checked={data.isCompleted}
              onCheckedChange={data.handleToggle}
              className="shrink-0 border-foreground/40 hover:border-foreground/60"
            />

            <p className={titleClass}>
              <LinkifiedText text={task.title} mode="inline" singleLine />
            </p>

            {!data.isCompleted && <PriorityDot visual={data.priorityVisual} />}

            {showStatusPill && (
              <span className={statusPillClass}>{data.statusLabel}</span>
            )}

            {data.isOverdue && (
              <span className={s.overdueIndicator}>
                <AlertTriangle className="size-3" />
                Overdue
              </span>
            )}

            {showTimeBlock && (
              <div className={s.timeBlock}>
                <Clock className={s.timeIcon} />
                <span className={s.timeText}>{data.timeRangeText}</span>
                <span className={s.timeDuration}>({data.duration})</span>
              </div>
            )}
          </div>

          {showDescription && (
            <TaskDescription content={task.description} className={s.cardDescription} />
          )}
        </div>
      </div>
    </TaskContextMenu>
  )
}
