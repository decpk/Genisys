import { useMemo } from 'react'

import { parseChartSpec } from './utils/parseChartSpec'
import type { ParseChartResult, RechartsViewerProps } from './RechartsViewer.types'

interface RechartsViewerData {
  parsed: ParseChartResult
}

export function useRechartsViewerData(props: RechartsViewerProps): RechartsViewerData {
  const { spec } = props

  const parsed = useMemo(() => parseChartSpec(spec), [spec])

  return { parsed }
}
