/**
 * Returns the micro-copy shown beneath the "Completed" section title.
 * The Completed card uses a muted, archive-style identity, so this copy
 * emphasizes the "wins shelf" framing rather than a count.
 */
export function getCompletedSubtitle(count: number): string {
  if (count === 0) return 'Nothing finished yet'
  if (count === 1) return '1 task wrapped today'
  return `${count} tasks wrapped today`
}
