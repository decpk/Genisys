import { useCallback } from 'react'

import { useWebLinksStore } from '@/store/weblinks-store'

import type { SortFilterBarViewModel } from './SortFilterBar.types'
import { getSortKeyLabel } from './utils/getSortKeyLabel'

/** Reads the sort/filter slice and exposes per-key sort + direction handlers. */
export function useSortFilterBarData(): SortFilterBarViewModel {
  const filterQuery = useWebLinksStore((state) => state.filterQuery)
  const sortKey = useWebLinksStore((state) => state.sortKey)
  const sortDirection = useWebLinksStore((state) => state.sortDirection)
  const setFilterQuery = useWebLinksStore((state) => state.setFilterQuery)
  const setSortKey = useWebLinksStore((state) => state.setSortKey)
  const setSortDirection = useWebLinksStore((state) => state.setSortDirection)

  const onFilterChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setFilterQuery(event.target.value),
    [setFilterQuery],
  )

  const onSortDateAdded = useCallback(() => setSortKey('dateAdded'), [setSortKey])
  const onSortTitle = useCallback(() => setSortKey('title'), [setSortKey])
  const onSortSiteName = useCallback(() => setSortKey('siteName'), [setSortKey])

  const onToggleDirection = useCallback(() => {
    const next = sortDirection === 'asc' ? 'desc' : 'asc'
    setSortDirection(next)
  }, [setSortDirection, sortDirection])

  return {
    filterQuery,
    sortKey,
    sortLabel: getSortKeyLabel(sortKey),
    isAscending: sortDirection === 'asc',
    onFilterChange,
    onSortDateAdded,
    onSortTitle,
    onSortSiteName,
    onToggleDirection,
  }
}
