import { useEffect, useMemo, useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useDailyPlanStore } from '@/store/daily-plan-store'
import {
  getMonthRange,
  getDaysInMonth,
  getDayOfWeek,
  isToday,
} from '../../utils/formatDate'
import type { DPTask } from '../../DailyPlan.types'

const WEEKDAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getStartDayOffset(firstDateStr: string): number {
  const date = new Date(firstDateStr + 'T00:00:00')
  return date.getDay() // 0=Sun
}

export function MonthView(): React.JSX.Element {
  const selectedDate = useDailyPlanStore((s) => s.selectedDate)
  const tasks = useDailyPlanStore((s) => s.tasks)
  const setSelectedDate = useDailyPlanStore((s) => s.setSelectedDate)
  const setViewMode = useDailyPlanStore((s) => s.setViewMode)
  const loadDataForRange = useDailyPlanStore((s) => s.loadDataForRange)

  const monthRange = useMemo(() => getMonthRange(selectedDate), [selectedDate])
  const daysInMonth = useMemo(() => getDaysInMonth(selectedDate), [selectedDate])
  const startOffset = useMemo(() => getStartDayOffset(daysInMonth[0]), [daysInMonth])

  useEffect(() => {
    loadDataForRange(monthRange.start, monthRange.end)
  }, [monthRange.start, monthRange.end, loadDataForRange])

  const handleDayClick = useCallback(
    (day: string) => {
      setSelectedDate(day)
      setViewMode('day')
    },
    [setSelectedDate, setViewMode],
  )

  const emptyCellsBefore = useMemo(() => {
    return Array.from({ length: startOffset }, (_, i) => i)
  }, [startOffset])

  const totalCells = startOffset + daysInMonth.length
  const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7)
  const emptyCellsAfter = useMemo(() => {
    return Array.from({ length: remainingCells }, (_, i) => i)
  }, [remainingCells])

  return (
    <div className="rounded-lg bg-border overflow-hidden">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-px">
        {WEEKDAY_HEADERS.map((header) => (
          <div
            key={header}
            className="bg-card px-2 py-2 text-center text-xs font-medium text-muted-foreground"
          >
            {header}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-px">
        {/* Empty cells before */}
        {emptyCellsBefore.map((i) => (
          <div key={`empty-before-${i}`} className="bg-card min-h-[100px]" />
        ))}

        {/* Actual day cells */}
        {daysInMonth.map((day) => {
          const dayTasks: DPTask[] = tasks[day] ?? []
          const today = isToday(day)
          const isSelected = day === selectedDate
          const dayNumber = parseInt(day.split('-')[2], 10)

          const totalCount = dayTasks.length
          const completedCount = dayTasks.filter((t) => t.status === 'completed').length

          let badgeColor = 'bg-primary'
          if (totalCount > 0 && completedCount === totalCount) {
            badgeColor = 'bg-green-500'
          } else if (totalCount > 0 && completedCount > 0) {
            badgeColor = 'bg-yellow-500'
          }

          return (
            <button
              key={day}
              type="button"
              onClick={() => handleDayClick(day)}
              className={cn(
                'bg-card min-h-[100px] p-2 flex flex-col items-start hover:bg-accent/50 transition-colors text-left',
                today && 'ring-2 ring-primary ring-inset',
              )}
            >
              <span
                className={cn(
                  'text-sm font-medium size-7 flex items-center justify-center rounded-full',
                  isSelected && 'bg-primary text-primary-foreground',
                  today && !isSelected && 'bg-primary/20 text-primary',
                )}
              >
                {dayNumber}
              </span>

              {totalCount > 0 && (
                <div className="mt-auto pt-2">
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium text-white',
                      badgeColor,
                    )}
                  >
                    {completedCount}/{totalCount}
                  </span>
                </div>
              )}
            </button>
          )
        })}

        {/* Empty cells after */}
        {emptyCellsAfter.map((i) => (
          <div key={`empty-after-${i}`} className="bg-card min-h-[100px]" />
        ))}
      </div>
    </div>
  )
}
