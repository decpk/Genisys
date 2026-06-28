/**
 * Returns the micro-copy shown beneath the "Reviews" section title. Conveys
 * at-a-glance active / done counts (or an empty-state line).
 */
export function getReviewsSubtitle(activeCount: number, completedCount: number): string {
  const total = activeCount + completedCount
  if (total === 0) return 'Nothing to review yet'
  if (activeCount === 0) return 'All reviews done'
  return `${activeCount} to review · ${completedCount} done`
}
