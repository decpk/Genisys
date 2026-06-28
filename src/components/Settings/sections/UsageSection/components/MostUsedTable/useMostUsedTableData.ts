import { useMemo } from 'react'

import { buildMostUsedRows } from './utils/buildMostUsedRows'
import type { MostUsedRow, MostUsedTableProps } from './MostUsedTable.types'

/** Memoizes the ranked, formatted table rows. */
export function useMostUsedTableData(props: MostUsedTableProps): MostUsedRow[] {
  const { perApp } = props
  return useMemo(() => buildMostUsedRows(perApp), [perApp])
}
