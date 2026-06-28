import { useEffect, useState } from 'react'

import { useDailyPlanStore } from '@/store/daily-plan-store'

import type { DPDailyEntry, DPWorkHoursFormData } from '../../DailyPlan.types'
import { generateId } from '../../utils/generateId'
import { getDefaultWorkHoursFormData } from './utils/getDefaultWorkHoursFormData'

export function useWorkHoursDialogData(
  open: boolean,
  onOpenChange: (open: boolean) => void,
) {
  const { selectedDate, dailyEntries, saveDailyEntry } = useDailyPlanStore()

  const currentEntry = dailyEntries[selectedDate]

  const [formData, setFormData] = useState<DPWorkHoursFormData>(
    getDefaultWorkHoursFormData(),
  )

  useEffect(() => {
    if (!open) return

    if (currentEntry) {
      setFormData({
        workStartTime: currentEntry.workStartTime,
        workEndTime: currentEntry.workEndTime,
        lunchStartTime: currentEntry.lunchStartTime,
        lunchEndTime: currentEntry.lunchEndTime,
      })
    } else {
      setFormData(getDefaultWorkHoursFormData())
    }
  }, [open, currentEntry])

  function handleFieldChange(
    field: keyof DPWorkHoursFormData,
    value: string | null,
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  function buildEntry(timeFields: DPWorkHoursFormData): DPDailyEntry {
    const now = new Date().toISOString()

    if (currentEntry) {
      return {
        ...currentEntry,
        ...timeFields,
        updatedAt: now,
      }
    }

    return {
      id: generateId('dpe'),
      date: selectedDate,
      motivationalQuote: '',
      statusContent: '',
      yesterdayReview: '',
      ...timeFields,
      createdAt: now,
      updatedAt: now,
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const entry = buildEntry(formData)
    saveDailyEntry(entry)
    onOpenChange(false)
  }

  function handleClear() {
    const clearedFields = getDefaultWorkHoursFormData()
    const entry = buildEntry(clearedFields)
    saveDailyEntry(entry)
    onOpenChange(false)
  }

  function handleClearWorkHours() {
    const updated: DPWorkHoursFormData = {
      ...formData,
      workStartTime: null,
      workEndTime: null,
    }
    setFormData(updated)
    const entry = buildEntry(updated)
    saveDailyEntry(entry)
  }

  function handleClearLunchHours() {
    const updated: DPWorkHoursFormData = {
      ...formData,
      lunchStartTime: null,
      lunchEndTime: null,
    }
    setFormData(updated)
    const entry = buildEntry(updated)
    saveDailyEntry(entry)
  }

  return { formData, handleFieldChange, handleSubmit, handleClear, handleClearWorkHours, handleClearLunchHours }
}
