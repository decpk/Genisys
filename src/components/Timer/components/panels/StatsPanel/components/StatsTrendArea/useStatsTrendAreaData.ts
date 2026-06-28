import { useMemo } from 'react'

import type {
  StatsTrendAreaProps,
  StatsTrendAreaViewModel,
} from './StatsTrendArea.types'
import { computeAverageDailyMinutes } from './utils/computeAverageDailyMinutes'
import { computeDailySeries } from './utils/computeDailySeries'

/**
 * Transforms the panel-level heatmap cells into the area-chart series and
 * its derived average. Memoized on cell-array identity so re-renders are
 * cheap when nothing changed.
 */
export function useStatsTrendAreaData(
  props: StatsTrendAreaProps,
): StatsTrendAreaViewModel {
  const { cells } = props

  const series = useMemo(() => computeDailySeries(cells), [cells])
  const averageMinutes = useMemo(
    () => computeAverageDailyMinutes(series),
    [series],
  )

  const hasData = series.some((p) => p.minutes > 0)

  return { hasData, series, averageMinutes }
}
