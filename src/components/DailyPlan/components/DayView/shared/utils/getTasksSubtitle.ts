/**
 * Returns the micro-copy shown beneath the "Today's Tasks" section title.
 * Conveys at-a-glance active / done counts (or an empty-state line).
 */
export function getTasksSubtitle(activeCount: number, completedCount: number): string {
  const total = activeCount + completedCount
  if (total === 0) return 'Nothing planned yet'
  if (activeCount === 0) return 'All caught up'
  return `${activeCount} active · ${completedCount} done`
}
