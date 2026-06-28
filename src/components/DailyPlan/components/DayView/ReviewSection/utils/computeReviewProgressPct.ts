/**
 * Returns the integer progress percentage (0-100) for a Review section based
 * on how many reviews are completed.
 */
export function computeReviewProgressPct(totalCount: number, completedCount: number): number {
  if (totalCount === 0) return 0
  return Math.round((completedCount / totalCount) * 100)
}
