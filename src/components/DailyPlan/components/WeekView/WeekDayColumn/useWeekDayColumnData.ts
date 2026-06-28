import { useCallback, useMemo } from 'react'
import { isToday } from '../../../utils/formatDate'

interface UseWeekDayColumnDataArgs {
  day: string
  onSelect: (day: string) => void
}

interface UseWeekDayColumnDataReturn {
  isTodayDay: boolean
  dayNumber: string
  handleHeaderClick: () => void
}

export function useWeekDayColumnData(args: UseWeekDayColumnDataArgs): UseWeekDayColumnDataReturn {
  const { day, onSelect } = args

  const isTodayDay = useMemo(() => isToday(day), [day])
  const dayNumber = useMemo(() => day.split('-')[2], [day])

  const handleHeaderClick = useCallback(() => {
    onSelect(day)
  }, [onSelect, day])

  return { isTodayDay, dayNumber, handleHeaderClick }
}
