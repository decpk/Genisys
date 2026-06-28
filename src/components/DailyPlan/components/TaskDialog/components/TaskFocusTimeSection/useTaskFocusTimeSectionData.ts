import { useEffect, useState } from 'react'

import { loadTaskFocusMinutes } from './api/loadTaskFocusMinutes'
import type { UseTaskFocusTimeSectionDataReturn } from './TaskFocusTimeSection.types'

export function useTaskFocusTimeSectionData(
  dailyPlanTaskId: string,
): UseTaskFocusTimeSectionDataReturn {
  const [isLoading, setIsLoading] = useState(true)
  const [totalMinutes, setTotalMinutes] = useState(0)
  const [sessionCount, setSessionCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    loadTaskFocusMinutes(dailyPlanTaskId)
      .then((res) => {
        if (cancelled) return
        setTotalMinutes(res.totalMinutes)
        setSessionCount(res.sessionCount)
      })
      .finally(() => {
        if (cancelled) return
        setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [dailyPlanTaskId])

  return { isLoading, totalMinutes, sessionCount }
}
