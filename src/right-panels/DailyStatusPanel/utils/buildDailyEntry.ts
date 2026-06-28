import type { DPDailyEntry } from '@/components/DailyPlan/DailyPlan.types'
import { generateId } from '@/components/DailyPlan/utils/generateId'

export function buildDailyEntry(
  existing: DPDailyEntry | undefined,
  selectedDate: string,
  markdown: string,
): DPDailyEntry {
  const now = new Date().toISOString()

  if (existing) {
    return { ...existing, statusContent: markdown, updatedAt: now }
  }

  return {
    id: generateId('entry'),
    date: selectedDate,
    motivationalQuote: '',
    statusContent: markdown,
    yesterdayReview: '',
    workStartTime: null,
    workEndTime: null,
    lunchStartTime: null,
    lunchEndTime: null,
    createdAt: now,
    updatedAt: now,
  }
}
