import { useEffect } from 'react'
import { useDailyPlanStore } from '@/store/daily-plan-store'
import { getYesterday } from './utils/formatDate'

export function useDailyPlanData() {
  const isInitialized = useDailyPlanStore((s) => s.isInitialized)
  const selectedDate = useDailyPlanStore((s) => s.selectedDate)
  const loadDataForDate = useDailyPlanStore((s) => s.loadDataForDate)
  const loadCategories = useDailyPlanStore((s) => s.loadCategories)
  const loadTemplates = useDailyPlanStore((s) => s.loadTemplates)

  useEffect(() => {
    loadCategories()
    loadTemplates()
    loadDataForDate(selectedDate)
    loadDataForDate(getYesterday())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { isLoaded: isInitialized }
}
