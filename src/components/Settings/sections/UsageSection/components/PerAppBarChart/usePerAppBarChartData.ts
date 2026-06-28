import { useMemo } from 'react'

import { TOP_APP_COUNT } from '../../UsageSection.constants'
import { buildPerAppBars } from './utils/buildPerAppBars'
import type { PerAppBarChartProps, PerAppBarDatum } from './PerAppBarChart.types'

/** Memoizes the top-N per-app bar data. */
export function usePerAppBarChartData(
  props: PerAppBarChartProps,
): PerAppBarDatum[] {
  const { perApp } = props
  return useMemo(() => buildPerAppBars(perApp, TOP_APP_COUNT), [perApp])
}
