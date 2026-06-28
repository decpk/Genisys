import { useMemo } from 'react'

import type {
  StatsTagShareDonutProps,
  StatsTagShareDonutViewModel,
} from './StatsTagShareDonut.types'
import { computeTagShareSlices } from './utils/computeTagShareSlices'

export function useStatsTagShareDonutData(
  props: StatsTagShareDonutProps,
): StatsTagShareDonutViewModel {
  const { perTag } = props

  const slices = useMemo(() => computeTagShareSlices(perTag), [perTag])

  let totalMinutes = 0
  for (const s of slices) totalMinutes += s.minutes

  return {
    hasData: slices.length > 0,
    slices,
    totalMinutes,
  }
}
