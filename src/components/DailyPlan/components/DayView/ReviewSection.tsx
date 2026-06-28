import { ClipboardCheck, Plus } from 'lucide-react'
import { ReviewCard } from './ReviewSection/ReviewCard'
import { ReviewDialog } from './ReviewSection/ReviewDialog'
import { useReviewSectionData } from './ReviewSection/useReviewSectionData'
import type { ReviewSectionProps } from './ReviewSection/ReviewSection.types'
import { SectionShell } from './shared/SectionShell'
import { SectionHeader } from './shared/SectionHeader'
import { SectionProgressBar } from './shared/SectionProgressBar'
import { SectionActionsMenu } from './shared/SectionActionsMenu'
import { moveReviewToDate } from '../../utils/moveReviewToDate'
import { useDailyPlanStore } from '@/store/daily-plan-store'
import type { DPReview } from '../../DailyPlan.types'
import { reviewSectionStyles as s } from './ReviewSection.styles'

export function ReviewSection(props: ReviewSectionProps): React.JSX.Element {
  const { reviews, defaultCollapsed, allComplete } = props
  const data = useReviewSectionData({
    reviews,
    defaultCollapsed: defaultCollapsed ?? false,
  })
  const saveReview = useDailyPlanStore((s) => s.saveReview)

  const progressBar = data.showProgressBar
    ? <SectionProgressBar percent={data.progressPct} />
    : null

  const emptyState = (
    <div className={s.emptyContainer}>
      <ClipboardCheck className={s.emptyIcon} />
      <p className={s.emptyText}>No reviews yet</p>
    </div>
  )

  let body: React.ReactNode = null
  if (!data.isCollapsed) {
    body = (
      <div className={s.cardList}>
        {reviews.length === 0 && emptyState}
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} onEdit={data.handleEditReview} />
        ))}
        <div className={s.quickAddContainer}>
          <Plus className={s.quickAddIcon} />
          <input
            type="text"
            value={data.quickAddValue}
            onChange={(e) => data.setQuickAddValue(e.target.value)}
            onKeyDown={data.handleQuickAddKeyDown}
            placeholder="Add a review..."
            className={s.quickAddInput}
          />
          <span className={s.quickAddHint}>
            <kbd className={s.quickAddKbd}>Enter</kbd>
          </span>
        </div>
      </div>
    )
  }

  const menu = (
    <SectionActionsMenu<DPReview>
      items={reviews}
      itemNoun="review"
      sectionTitle="Reviews"
      moveItem={moveReviewToDate}
      saveItem={saveReview}
      getIsCompleted={(r) => r.status === 'completed'}
    />
  )

  return (
    <SectionShell variant="reviews">
      <SectionHeader
        variant="reviews"
        title="Reviews"
        subtitle={data.subtitle}
        countLabel={data.countLabel}
        collapsed={data.isCollapsed}
        allComplete={allComplete}
        onToggle={data.toggleCollapsed}
        rightSlot={progressBar}
        menuSlot={menu}
      />
      {body}
      <ReviewDialog
        open={data.reviewDialogOpen}
        onOpenChange={data.handleReviewDialogClose}
        editReview={data.editingReview}
      />
    </SectionShell>
  )
}
