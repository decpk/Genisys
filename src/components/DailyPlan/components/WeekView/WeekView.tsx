import { WeekDayColumn } from './WeekDayColumn'
import { useWeekViewData } from './useWeekViewData'

export function WeekView(): React.JSX.Element {
  const {
    weekDays,
    tasksByDay,
    meetingsByDay,
    selectedDate,
    handleDayClick,
    handleToggleTask,
  } = useWeekViewData()

  return (
    <div className="grid grid-cols-7 gap-px rounded-lg bg-border overflow-hidden h-full">
      {weekDays.map((day) => (
        <WeekDayColumn
          key={day}
          day={day}
          tasks={tasksByDay[day]}
          meetings={meetingsByDay[day]}
          isSelected={day === selectedDate}
          onSelect={handleDayClick}
          onToggleTask={handleToggleTask}
        />
      ))}
    </div>
  )
}
