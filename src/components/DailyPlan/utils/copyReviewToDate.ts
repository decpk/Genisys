import type { DPReview } from '../DailyPlan.types'
import { generateId } from './generateId'

/** Pure builder: returns a NEW DPReview (fresh id/timestamps, reset status) scheduled on targetDate */
export function copyReviewToDate(review: DPReview, targetDate: string): DPReview {
  const now = new Date().toISOString()
  return {
    ...review,
    id: generateId('review'),
    scheduledDate: targetDate,
    status: 'todo',
    completedAt: null,
    createdAt: now,
    updatedAt: now,
  }
}
