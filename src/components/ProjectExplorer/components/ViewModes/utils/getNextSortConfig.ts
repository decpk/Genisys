import type { SortConfig, SortField } from '../ViewModes.types'

export function getNextSortConfig(currentSort: SortConfig, field: SortField): SortConfig {
  if (currentSort.field === field) {
    return { field, direction: currentSort.direction === 'asc' ? 'desc' : 'asc' }
  }
  return { field, direction: 'asc' }
}
