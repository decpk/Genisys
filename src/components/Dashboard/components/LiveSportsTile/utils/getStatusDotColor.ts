import type { FetchStatus } from '../LiveSportsTile.types'

/**
 * Return the CSS class for the header status dot based on current state.
 */
export function getStatusDotColor(
  refreshing: boolean,
  status: FetchStatus,
  isFetching: boolean,
): string {
  if (refreshing) return 'bg-amber-500 score-refreshing-dot'
  if (status === 'ready') return 'bg-green-500'
  if (isFetching) return 'bg-amber-500 animate-pulse'
  if (status === 'error') return 'bg-red-500'
  return 'bg-muted-foreground/40'
}
