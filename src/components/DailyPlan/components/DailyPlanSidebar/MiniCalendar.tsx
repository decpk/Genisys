import { useCallback, useMemo } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { useDailyPlanStore } from '@/store/daily-plan-store'

function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00')
}

function toDateStr(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function MiniCalendar(): React.JSX.Element {
  const selectedDate = useDailyPlanStore((s) => s.selectedDate)
  const setSelectedDate = useDailyPlanStore((s) => s.setSelectedDate)
  const setViewMode = useDailyPlanStore((s) => s.setViewMode)
  const tasks = useDailyPlanStore((s) => s.tasks)
  const loadDataForDate = useDailyPlanStore((s) => s.loadDataForDate)

  const selected = useMemo(() => parseDate(selectedDate), [selectedDate])

  const taskDates = useMemo(() => {
    const dates: Date[] = []
    for (const dateStr of Object.keys(tasks)) {
      if (tasks[dateStr].length > 0) {
        dates.push(parseDate(dateStr))
      }
    }
    return dates
  }, [tasks])

  const handleSelect = useCallback(
    (date: Date | undefined) => {
      if (!date) return
      const dateStr = toDateStr(date)
      setSelectedDate(dateStr)
      setViewMode('day')
      loadDataForDate(dateStr)
    },
    [setSelectedDate, setViewMode, loadDataForDate],
  )

  return (
    <Calendar
      mode="single"
      selected={selected}
      onSelect={handleSelect}
      modifiers={{ hasTasks: taskDates }}
      modifiersClassNames={{
        hasTasks:
          "relative after:absolute after:bottom-0.5 after:left-1/2 after:-translate-x-1/2 after:size-1 after:rounded-full after:bg-primary aria-selected:after:bg-primary-foreground",
      }}
      className="p-0 w-full"
      classNames={{
        months: "flex flex-col w-full",
        month: "flex flex-col gap-2 w-full",
        month_caption: "flex justify-center relative items-center w-full",
        caption_label: "text-xs font-medium",
        nav: "flex items-center gap-1",
        button_previous:
          "size-6 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-0 cursor-pointer",
        button_next:
          "size-6 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-0 cursor-pointer",
        month_grid: "w-full border-collapse",
        weekdays: "flex w-full",
        weekday:
          "text-muted-foreground flex-1 text-center font-normal text-[10px]",
        week: "flex w-full mt-1",
        day: "relative flex-1 p-0 text-center text-xs",
        day_button:
          "w-full h-8 p-0 font-normal text-xs rounded-md transition-colors cursor-pointer hover:bg-accent hover:text-accent-foreground aria-selected:opacity-100",
        selected:
          "bg-primary text-primary-foreground rounded-md hover:bg-primary hover:text-primary-foreground",
        today: "bg-accent text-accent-foreground font-semibold",
        outside: "text-muted-foreground/40",
      }}
    />
  );
}
