import type { SortField } from '../ViewModes.types'

/**
 * Maps table column IDs to their corresponding SortField.
 * Columns not in this map are not sortable.
 */
export const COLUMN_TO_SORT_FIELD: Record<string, SortField> = {
  name: 'name',
  size: 'size',
  ext: 'extension',
  modified: 'modified',
  type: 'type',
}
