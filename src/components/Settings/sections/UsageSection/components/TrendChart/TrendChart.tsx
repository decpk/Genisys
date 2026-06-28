import { memo } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { EmptyState } from '@/components/ui/empty-state'

import {
  USAGE_AREA_COLOR,
  USAGE_AXIS_TICK,
  USAGE_CHART_HEIGHT,
  USAGE_GRID_STROKE,
  USAGE_TOOLTIP_CONTENT_STYLE,
  USAGE_TOOLTIP_CURSOR,
} from '../../UsageSection.constants'
import { formatDurationTooltip } from '../../utils/formatDurationTooltip'
import { useTrendChartData } from './useTrendChartData'
import type { TrendChartProps } from './TrendChart.types'

export const TrendChart = memo(function TrendChart(
  props: TrendChartProps,
): React.JSX.Element {
  const series = useTrendChartData(props)

  if (series.length === 0) {
    return <EmptyState message="No daily activity yet." className="py-12" />
  }

  return (
    <ResponsiveContainer width="100%" height={USAGE_CHART_HEIGHT}>
      <AreaChart data={series} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="usageTrendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={USAGE_AREA_COLOR} stopOpacity={0.35} />
            <stop offset="100%" stopColor={USAGE_AREA_COLOR} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={USAGE_GRID_STROKE} />
        <XAxis dataKey="label" tick={USAGE_AXIS_TICK} tickLine={false} axisLine={false} />
        <YAxis tick={USAGE_AXIS_TICK} tickLine={false} axisLine={false} width={48} tickFormatter={formatDurationTooltip} />
        <RechartsTooltip cursor={USAGE_TOOLTIP_CURSOR} contentStyle={USAGE_TOOLTIP_CONTENT_STYLE} formatter={formatDurationTooltip} />
        <Area type="monotone" dataKey="foregroundMs" name="Active time" stroke={USAGE_AREA_COLOR} strokeWidth={2} fill="url(#usageTrendFill)" isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
})
