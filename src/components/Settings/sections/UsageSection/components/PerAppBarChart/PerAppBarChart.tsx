import { memo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { EmptyState } from '@/components/ui/empty-state'

import {
  USAGE_AXIS_TICK,
  USAGE_CHART_HEIGHT,
  USAGE_CHART_PALETTE,
  USAGE_GRID_STROKE,
  USAGE_TOOLTIP_CONTENT_STYLE,
  USAGE_TOOLTIP_CURSOR,
} from '../../UsageSection.constants'
import { formatDurationTooltip } from '../../utils/formatDurationTooltip'
import { usePerAppBarChartData } from './usePerAppBarChartData'
import type { PerAppBarChartProps } from './PerAppBarChart.types'

export const PerAppBarChart = memo(function PerAppBarChart(
  props: PerAppBarChartProps,
): React.JSX.Element {
  const bars = usePerAppBarChartData(props)

  if (bars.length === 0) {
    return <EmptyState message="No app activity yet." className="py-12" />
  }

  return (
    <ResponsiveContainer width="100%" height={USAGE_CHART_HEIGHT}>
      <BarChart data={bars} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={USAGE_GRID_STROKE} />
        <XAxis dataKey="name" tick={USAGE_AXIS_TICK} tickLine={false} axisLine={false} interval={0} />
        <YAxis tick={USAGE_AXIS_TICK} tickLine={false} axisLine={false} width={48} tickFormatter={formatDurationTooltip} />
        <RechartsTooltip cursor={USAGE_TOOLTIP_CURSOR} contentStyle={USAGE_TOOLTIP_CONTENT_STYLE} formatter={formatDurationTooltip} />
        <Bar dataKey="foregroundMs" name="Active time" fill={USAGE_CHART_PALETTE[0]} radius={[4, 4, 0, 0]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  )
})
