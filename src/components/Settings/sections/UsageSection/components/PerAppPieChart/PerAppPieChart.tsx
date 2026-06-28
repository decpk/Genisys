import { memo } from 'react'
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts'

import { EmptyState } from '@/components/ui/empty-state'

import {
  USAGE_CHART_HEIGHT,
  USAGE_CHART_PALETTE,
  USAGE_TOOLTIP_CONTENT_STYLE,
} from '../../UsageSection.constants'
import { formatDurationTooltip } from '../../utils/formatDurationTooltip'
import { usePerAppPieChartData } from './usePerAppPieChartData'
import type { PerAppPieChartProps } from './PerAppPieChart.types'

const LEGEND_STYLE = { fontSize: 11, color: 'var(--color-muted-foreground)' } as const

export const PerAppPieChart = memo(function PerAppPieChart(
  props: PerAppPieChartProps,
): React.JSX.Element {
  const slices = usePerAppPieChartData(props)

  if (slices.length === 0) {
    return <EmptyState message="No app activity yet." className="py-12" />
  }

  return (
    <ResponsiveContainer width="100%" height={USAGE_CHART_HEIGHT}>
      <PieChart>
        <RechartsTooltip contentStyle={USAGE_TOOLTIP_CONTENT_STYLE} formatter={formatDurationTooltip} />
        <Legend wrapperStyle={LEGEND_STYLE} />
        <Pie data={slices} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={44} paddingAngle={2} isAnimationActive={false}>
          {slices.map((slice, index) => {
            const color = USAGE_CHART_PALETTE[index % USAGE_CHART_PALETTE.length]
            return <Cell key={slice.name} fill={color} />
          })}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  )
})
