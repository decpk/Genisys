import type { DPReview } from '../../../../DailyPlan.types'
import type { PriorityVisual } from '../../shared/priority'

export interface ReviewCardProps {
  review: DPReview
  onEdit: (review: DPReview) => void
}

export interface ReviewCardDataState {
  isCompleted: boolean
  hasTime: boolean
  endTime: string | null
  duration: string
  statusLabel: string | null
  statusPillClass: string | null
  reviewTypeLabel: string
  reviewTypePillClass: string
  priorityVisual: PriorityVisual
  timeRangeText: string | null
  showAutoReviewerButton: boolean
  isPRReview: boolean
  showAuthor: boolean
  authorName: string
  authorAvatarUrl: string
  handleToggle: () => void
  handleDoubleClick: () => void
  handleOpenInAutoReviewer: () => void
}
