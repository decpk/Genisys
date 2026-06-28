import { useMemo } from 'react'

import { TOP_APP_COUNT } from '../../UsageSection.constants'
import { buildAvgSessionRows } from './utils/buildAvgSessionRows'
import type { AvgSessionLengthProps, AvgSessionRow } from './AvgSessionLength.types'

/** Memoizes the top-N average-session-length rows. */
export function useAvgSessionLengthData(
  props: AvgSessionLengthProps,
): AvgSessionRow[] {
  const { perApp } = props
  return useMemo(() => buildAvgSessionRows(perApp, TOP_APP_COUNT), [perApp])
}
