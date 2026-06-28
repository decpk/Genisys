import type { DPSearchResultItem } from '../DailyPlanSearchPanel.types'

export interface SearchResultItemProps {
  item: DPSearchResultItem
  onNavigate: (date: string) => void
}
