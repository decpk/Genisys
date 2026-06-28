import type { DPReview } from '../../../DailyPlan.types'

export interface ReviewSectionProps {
  reviews: DPReview[]
  defaultCollapsed?: boolean
  allComplete?: boolean
}
