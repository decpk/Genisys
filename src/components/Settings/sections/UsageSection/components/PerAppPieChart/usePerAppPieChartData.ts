import { useMemo } from 'react'

import { TOP_APP_COUNT } from '../../UsageSection.constants'
import { buildPerAppSlices } from './utils/buildPerAppSlices'
import type { PerAppPieChartProps, PerAppPieDatum } from './PerAppPieChart.types'

/** Memoizes the top-N per-app pie slices. */
export function usePerAppPieChartData(
  props: PerAppPieChartProps,
): PerAppPieDatum[] {
  const { perApp } = props
  return useMemo(() => buildPerAppSlices(perApp, TOP_APP_COUNT), [perApp])
}
