import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  AXIS_TICK,
  CHART_HEIGHT,
  GRID_STROKE,
  LEGEND_STYLE,
  TOOLTIP_CONTENT_STYLE,
  TOOLTIP_CURSOR,
} from '../RechartsViewer.constants'
import { pickPaletteColor } from '../utils/pickPaletteColor'
import type { ChartViewProps } from '../RechartsViewer.types'

export function AreaChartView(props: ChartViewProps): React.JSX.Element {
  const { spec } = props
  const series = spec.series ?? []

  return (
    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
      <AreaChart data={spec.data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <defs>
          {series.map((s, i) => {
            const color = pickPaletteColor(i, s.color)
            return (
              <linearGradient key={s.key} id={`chart-area-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            )
          })}
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_STROKE} />
        <XAxis dataKey={spec.xKey} tick={AXIS_TICK} tickLine={false} axisLine={false} />
        <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={40} />
        <RechartsTooltip cursor={TOOLTIP_CURSOR} contentStyle={TOOLTIP_CONTENT_STYLE} />
        <Legend wrapperStyle={LEGEND_STYLE} />
        {series.map((s, i) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name ?? s.key}
            stroke={pickPaletteColor(i, s.color)}
            strokeWidth={1.5}
            fill={`url(#chart-area-${s.key})`}
            isAnimationActive={false}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}
