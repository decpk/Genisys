import type { PreviewSortKey } from '@/components/WebLinks/WebLinks.types'

/** View-model returned by `useSortFilterBarData`. */
export interface SortFilterBarViewModel {
  /** Current free-text filter value. */
  filterQuery: string
  /** Active sort key. */
  sortKey: PreviewSortKey
  /** Human-friendly label for the active sort key. */
  sortLabel: string
  /** Whether the sort direction is ascending. */
  isAscending: boolean
  /** Filter input change handler. */
  onFilterChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  /** Sort by date added. */
  onSortDateAdded: () => void
  /** Sort by title. */
  onSortTitle: () => void
  /** Sort by site name. */
  onSortSiteName: () => void
  /** Flip the sort direction. */
  onToggleDirection: () => void
}
