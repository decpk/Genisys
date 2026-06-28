import { useMemo } from 'react'

import type {
  StatsDayOfWeekPatternProps,
  StatsDayOfWeekPatternViewModel,
} from './StatsDayOfWeekPattern.types'
import { computeDayOfWeekStats } from './utils/computeDayOfWeekStats'
import { findBestDayOfWeek } from './utils/findBestDayOfWeek'

export function useStatsDayOfWeekPatternData(
  props: StatsDayOfWeekPatternProps,
): StatsDayOfWeekPatternViewModel {
  const { cells } = props

  const stats = useMemo(() => computeDayOfWeekStats(cells), [cells])
  const bestIndex = useMemo(() => findBestDayOfWeek(stats), [stats])

  const hasData = stats.some((s) => s.totalMinutes > 0)

  let bestLabel: string | null = null
  let bestAvgMinutes = 0
  if (bestIndex >= 0) {
    bestLabel = stats[bestIndex].label
    bestAvgMinutes = stats[bestIndex].avgMinutes
  }

  return { hasData, stats, bestIndex, bestLabel, bestAvgMinutes }
}
