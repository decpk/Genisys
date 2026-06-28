/**
 * Builds the "{done}/{total}" label rendered inside the `SectionCountChip`
 * for a Review section.
 */
export function formatReviewCountLabel(args: {
  totalCount: number
  completedCount: number
}): string {
  const { totalCount, completedCount } = args
  return `${completedCount}/${totalCount}`
}
