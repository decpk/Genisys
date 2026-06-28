import type { DPSearchResultItem } from '../DailyPlanSearchPanel.types'

export function getResultDate(item: DPSearchResultItem): string {
  return item.data.scheduledDate
}
