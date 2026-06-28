import { useEffect, useMemo, useCallback } from 'react'
import { useDailyPlanStore } from '@/store/daily-plan-store'
import { getWeekRange, getWeekDays } from '../../utils/formatDate'
import { sortDPItems } from '../../utils/sortDPItems'
import type { DPTask, DPMeeting } from '../../DailyPlan.types'

interface UseWeekViewDataReturn {
  weekDays: string[]
  tasksByDay: Record<string, DPTask[]>
  meetingsByDay: Record<string, DPMeeting[]>
  selectedDate: string
  handleDayClick: (day: string) => void
  handleToggleTask: (taskId: string, day: string) => void
}

export function useWeekViewData(): UseWeekViewDataReturn {
  const selectedDate = useDailyPlanStore((s) => s.selectedDate)
  const tasks = useDailyPlanStore((s) => s.tasks)
  const meetings = useDailyPlanStore((s) => s.meetings)
  const setSelectedDate = useDailyPlanStore((s) => s.setSelectedDate)
  const setViewMode = useDailyPlanStore((s) => s.setViewMode)
  const toggleTaskComplete = useDailyPlanStore((s) => s.toggleTaskComplete)
  const loadDataForRange = useDailyPlanStore((s) => s.loadDataForRange)
  const taskSortBy = useDailyPlanStore((s) => s.taskSortBy)
  const taskSortDir = useDailyPlanStore((s) => s.taskSortDir)

  const weekRange = useMemo(() => getWeekRange(selectedDate), [selectedDate])
  const weekDays = useMemo(() => getWeekDays(weekRange.start), [weekRange.start])

  useEffect(() => {
    loadDataForRange(weekRange.start, weekRange.end)
  }, [weekRange.start, weekRange.end, loadDataForRange])

  const handleDayClick = useCallback(
    (day: string) => {
      setSelectedDate(day)
      setViewMode('day')
    },
    [setSelectedDate, setViewMode],
  )

  const handleToggleTask = useCallback(
    (taskId: string, date: string) => {
      toggleTaskComplete(taskId, date)
    },
    [toggleTaskComplete],
  )

  const tasksByDay = useMemo(() => {
    const result: Record<string, DPTask[]> = {}
    weekDays.forEach((day) => {
      result[day] = sortDPItems(tasks[day] ?? [], taskSortBy, taskSortDir)
    })
    return result
  }, [weekDays, tasks, taskSortBy, taskSortDir])

  const meetingsByDay = useMemo(() => {
    const result: Record<string, DPMeeting[]> = {}
    weekDays.forEach((day) => {
      result[day] = meetings[day] ?? []
    })
    return result
  }, [weekDays, meetings])

  return {
    weekDays,
    tasksByDay,
    meetingsByDay,
    selectedDate,
    handleDayClick,
    handleToggleTask,
  }
}
