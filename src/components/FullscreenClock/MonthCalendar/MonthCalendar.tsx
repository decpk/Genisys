import { cn } from '@/lib/utils'

import {
  CALENDAR_CONTAINER,
  CALENDAR_HEADER,
  DAY_CELL_ADJACENT_MONTH,
  DAY_CELL_BASE,
  DAY_CELL_CURRENT_MONTH,
  DAY_CELL_TODAY,
  DAY_GRID,
  WEEKDAY_CELL,
  WEEKDAY_ROW,
} from './MonthCalendar.styles'
import type { MonthCalendarProps } from './MonthCalendar.types'
import { useMonthCalendarData } from './useMonthCalendarData'

export function MonthCalendar(props: MonthCalendarProps): React.JSX.Element {
  const { now } = props
  const { monthYearLabel, weekdayLabels, cells } = useMonthCalendarData(now)

  return (
    <div className={CALENDAR_CONTAINER}>
      <div className={CALENDAR_HEADER}>{monthYearLabel}</div>

      <div className={WEEKDAY_ROW}>
        {weekdayLabels.map((label) => (
          <div key={label} className={WEEKDAY_CELL}>
            {label.charAt(0)}
          </div>
        ))}
      </div>

      <div className={DAY_GRID}>
        {cells.map((cell) => {
          let stateClass = DAY_CELL_ADJACENT_MONTH
          if (cell.isToday) {
            stateClass = DAY_CELL_TODAY
          } else if (cell.isCurrentMonth) {
            stateClass = DAY_CELL_CURRENT_MONTH
          }

          return (
            <div key={cell.key} className={cn(DAY_CELL_BASE, stateClass)}>
              {cell.label}
            </div>
          )
        })}
      </div>
    </div>
  )
}
