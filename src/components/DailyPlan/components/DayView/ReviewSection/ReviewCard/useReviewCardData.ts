import { useDailyPlanStore } from '@/store/daily-plan-store'
import { useNavigationStore } from '@/store/navigation-store'
import type { DPReview } from '../../../../DailyPlan.types'
import { computeEndTime } from '../../../../utils/computeEndTime'
import { formatTimeRange } from '../../../../utils/formatTime'
import { computeDurationLabel } from '../../utils/computeDurationLabel'
import {
  getPriorityVisual,
  COMPLETED_PRIORITY_VISUAL,
} from '../../shared/priority'
import { getReviewTypeMeta } from './utils/getReviewTypeMeta'
import { REVIEW_STATUS_PILL_STYLES, REVIEW_STATUS_LABELS } from './ReviewCard.styles'
import type { ReviewCardDataState } from './ReviewCard.types'

interface UseReviewCardDataArgs {
  review: DPReview
  onEdit: (review: DPReview) => void
}

export function useReviewCardData(args: UseReviewCardDataArgs): ReviewCardDataState {
  const { review, onEdit } = args
  const toggleReviewComplete = useDailyPlanStore((s) => s.toggleReviewComplete)
  const openAutoReviewerPR = useNavigationStore((s) => s.openAutoReviewerPR)

  const isCompleted = review.status === 'completed'
  const hasTime = !!review.scheduledTime
  const endTime = hasTime ? computeEndTime(review.scheduledTime!, review.durationMinutes) : null
  const duration = hasTime
    ? computeDurationLabel(review.scheduledTime!, endTime!)
    : `${review.durationMinutes}m`

  const statusLabel = REVIEW_STATUS_LABELS[review.status] ?? null
  const statusPillClass = REVIEW_STATUS_PILL_STYLES[review.status] ?? null

  const typeMeta = getReviewTypeMeta(review.reviewType)

  const priorityVisual = isCompleted
    ? COMPLETED_PRIORITY_VISUAL
    : getPriorityVisual(review.priority)

  const timeRangeText = hasTime && endTime ? formatTimeRange(review.scheduledTime!, endTime) : null

  // PR-type reviews can be opened back inside the Auto Reviewer (same PR).
  const isPRReview = review.reviewType === 'pr'
  const showAutoReviewerButton = isPRReview && !!review.link
  // PR reviews can carry an author (whose PR this is) + avatar.
  const showAuthor = isPRReview && review.authorName.trim().length > 0

  function handleToggle() {
    toggleReviewComplete(review)
  }

  function handleDoubleClick() {
    onEdit(review)
  }

  function handleOpenInAutoReviewer() {
    openAutoReviewerPR(review.link)
  }

  return {
    isCompleted,
    hasTime,
    endTime,
    duration,
    statusLabel,
    statusPillClass,
    reviewTypeLabel: typeMeta.label,
    reviewTypePillClass: typeMeta.pillClass,
    priorityVisual,
    timeRangeText,
    showAutoReviewerButton,
    isPRReview,
    showAuthor,
    authorName: review.authorName,
    authorAvatarUrl: review.authorAvatarUrl,
    handleToggle,
    handleDoubleClick,
    handleOpenInAutoReviewer,
  }
}
