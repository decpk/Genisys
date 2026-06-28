/**
 * Returns the integer progress percentage (0-100) for a Today's Tasks
 * section based on how many tasks are completed.
 */
export function computeProgressPct(totalCount: number, completedCount: number): number {
  if (totalCount === 0) return 0
  return Math.round((completedCount / totalCount) * 100)
}
