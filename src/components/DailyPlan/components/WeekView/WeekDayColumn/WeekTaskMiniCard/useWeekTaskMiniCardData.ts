import { useCallback } from 'react'
import type { WeekTaskMiniCardProps } from './WeekTaskMiniCard.types'

interface UseWeekTaskMiniCardDataReturn {
  isCompleted: boolean
  handleToggle: () => void
}

export function useWeekTaskMiniCardData(props: WeekTaskMiniCardProps): UseWeekTaskMiniCardDataReturn {
  const { task, day, onToggle } = props

  const isCompleted = task.status === 'completed'

  const handleToggle = useCallback(() => {
    onToggle(task.id, day)
  }, [task.id, day, onToggle])

  return { isCompleted, handleToggle }
}
