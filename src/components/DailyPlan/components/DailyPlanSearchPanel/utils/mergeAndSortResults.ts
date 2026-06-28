import type { DPTask, DPMeeting } from '@/components/DailyPlan/DailyPlan.types'
import type { DPSearchResultItem } from '../DailyPlanSearchPanel.types'

export function mergeAndSortResults(tasks: DPTask[], meetings: DPMeeting[]): DPSearchResultItem[] {
  const taskItems: DPSearchResultItem[] = tasks.map((t) => ({ type: 'task', data: t }))
  const meetingItems: DPSearchResultItem[] = meetings.map((m) => ({ type: 'meeting', data: m }))
  const merged = [...taskItems, ...meetingItems]

  merged.sort((a, b) => {
    const dateA = a.data.scheduledDate
    const dateB = b.data.scheduledDate
    return dateB.localeCompare(dateA)
  })

  return merged
}
