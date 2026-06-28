import { searchResultItemStyles } from '../DailyPlanSearchPanel.styles'

const PRIORITY_STYLE_MAP: Record<string, string> = {
  low: searchResultItemStyles.priorityLow,
  medium: searchResultItemStyles.priorityMedium,
  high: searchResultItemStyles.priorityHigh,
  urgent: searchResultItemStyles.priorityUrgent,
  critical: searchResultItemStyles.priorityCritical,
}

export function getPriorityStyle(priority: string): string {
  return PRIORITY_STYLE_MAP[priority] || searchResultItemStyles.priorityLow
}
