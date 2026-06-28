import { useMemo } from 'react'

import { buildTrendSeries } from './utils/buildTrendSeries'
import type { TrendChartProps, TrendDatum } from './TrendChart.types'

/** Memoizes the ordered daily trend series. */
export function useTrendChartData(props: TrendChartProps): TrendDatum[] {
  const { perDay } = props
  return useMemo(() => buildTrendSeries(perDay), [perDay])
}
