import type { DPReview } from '@/components/DailyPlan/DailyPlan.types'

export function getIncompleteReviews(reviews: DPReview[]): DPReview[] {
  return reviews.filter((review) => review.status !== 'completed')
}
