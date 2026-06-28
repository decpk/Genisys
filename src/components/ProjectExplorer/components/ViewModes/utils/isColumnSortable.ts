import { COLUMN_TO_SORT_FIELD } from './columnToSortField'

export function isColumnSortable(columnId: string): boolean {
  return columnId in COLUMN_TO_SORT_FIELD
}
