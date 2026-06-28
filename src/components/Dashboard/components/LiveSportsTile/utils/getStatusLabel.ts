import type { FetchStatus } from '../LiveSportsTile.types'

/**
 * Map a FetchStatus to a user-visible loading label.
 * Returns empty string for non-loading states.
 */
export function getStatusLabel(status: FetchStatus): string {
  switch (status) {
    case 'resolving-url':
      return 'Finding best source…'
    case 'crawling':
      return 'Fetching scores…'
    case 'parsing':
      return 'Analyzing scores…'
    default:
      return ''
  }
}
