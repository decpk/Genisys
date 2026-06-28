import type { DPReview } from '../DailyPlan.types'

/** Pure builder: returns a new DPReview with scheduledDate set to targetDate and updatedAt refreshed */
export function moveReviewToDate(review: DPReview, targetDate: string): DPReview {
  return {
    ...review,
    scheduledDate: targetDate,
    updatedAt: new Date().toISOString(),
  }
}
