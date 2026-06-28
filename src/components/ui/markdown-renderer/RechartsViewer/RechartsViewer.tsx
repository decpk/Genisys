import { BarChart3 } from 'lucide-react'

import { AreaChartView } from './AreaChartView'
import { BarChartView } from './BarChartView'
import { ChartError } from './ChartError'
import { LineChartView } from './LineChartView'
import { PieChartView } from './PieChartView'
import { bodyStyles, containerStyles, headerStyles, labelStyles, titleStyles } from './RechartsViewer.styles'
import { useRechartsViewerData } from './useRechartsViewerData'
import type { ChartType, ChartViewProps, RechartsViewerProps } from './RechartsViewer.types'

const CHART_VIEWS: Record<ChartType, (props: ChartViewProps) => React.JSX.Element> = {
  bar: BarChartView,
  line: LineChartView,
  area: AreaChartView,
  pie: PieChartView,
}

export function RechartsViewer(props: RechartsViewerProps): React.JSX.Element {
  const { parsed } = useRechartsViewerData(props)

  if (!parsed.ok) {
    return <ChartError error={parsed.error} />
  }

  const { spec } = parsed
  const ChartView = CHART_VIEWS[spec.type]

  const titleNode = spec.title ? <span className={titleStyles}>{spec.title}</span> : null

  return (
    <div className={containerStyles}>
      <div className={headerStyles}>
        <BarChart3 size={12} className="text-primary/60" />
        <span className={labelStyles}>Chart</span>
        {titleNode}
      </div>
      <div className={bodyStyles}>
        <ChartView spec={spec} />
      </div>
    </div>
  )
}
