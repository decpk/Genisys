import { cn } from '@/lib/utils'
import { getDayOfWeek } from '../../../utils/formatDate'
import { WeekMeetingMiniCard } from './WeekMeetingMiniCard'
import { WeekTaskMiniCard } from './WeekTaskMiniCard'
import { useWeekDayColumnData } from './useWeekDayColumnData'
import { weekDayColumnStyles as s } from './WeekDayColumn.styles'
import type { WeekDayColumnProps } from './WeekDayColumn.types'

export function WeekDayColumn(props: WeekDayColumnProps): React.JSX.Element {
  const { day, tasks, meetings, isSelected, onSelect, onToggleTask } = props
  const { isTodayDay, dayNumber, handleHeaderClick } = useWeekDayColumnData({ day, onSelect })

  const columnClass = cn(s.columnContainer, isTodayDay && s.columnContainerToday)
  const headerClass = cn(s.headerButton, isSelected && s.headerButtonSelected)
  const dayCircleClass = cn(s.dayNumberCircle, isTodayDay && s.dayNumberCircleToday)
  const isEmpty = tasks.length === 0 && meetings.length === 0

  return (
    <div className={columnClass}>
      <button type="button" onClick={handleHeaderClick} className={headerClass}>
        <span className={s.weekdayLabel}>{getDayOfWeek(day)}</span>
        <span className={dayCircleClass}>{dayNumber}</span>
      </button>

      <div className={s.bodyContainer}>
        {meetings.map((meeting) => (
          <WeekMeetingMiniCard key={meeting.id} meeting={meeting} />
        ))}

        {tasks.map((task) => (
          <WeekTaskMiniCard
            key={task.id}
            task={task}
            day={day}
            onToggle={onToggleTask}
          />
        ))}

        {isEmpty && <p className={s.emptyState}>No items</p>}
      </div>
    </div>
  )
}
