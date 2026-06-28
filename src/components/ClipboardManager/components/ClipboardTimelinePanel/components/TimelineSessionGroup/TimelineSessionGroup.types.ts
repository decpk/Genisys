import type { WorkSession } from '../../../../utils/timeline-insights/sessions'
import type { CategoryBreakdown } from '../../../../utils/timeline-insights/category-breakdown'
import type { SecurityAlert } from '../../../../utils/timeline-insights/security-pulse'

export interface TimelineSessionGroupProps {
  session: WorkSession
  categoryBreakdown: CategoryBreakdown | undefined
  securityAlerts: SecurityAlert[]
}
