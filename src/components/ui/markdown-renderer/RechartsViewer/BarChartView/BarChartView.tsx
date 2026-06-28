import {
  Bar,
  BarChart,
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

export function BarChartView(props: ChartViewProps): React.JSX.Element {
  const { spec } = props
  const series = spec.series ?? []

  return (
    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
      <BarChart data={spec.data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_STROKE} />
        <XAxis dataKey={spec.xKey} tick={AXIS_TICK} tickLine={false} axisLine={false} />
        <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={40} />
        <RechartsTooltip cursor={TOOLTIP_CURSOR} contentStyle={TOOLTIP_CONTENT_STYLE} />
        <Legend wrapperStyle={LEGEND_STYLE} />
        {series.map((s, i) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.name ?? s.key}
            fill={pickPaletteColor(i, s.color)}
            radius={[4, 4, 0, 0]}
            isAnimationActive={false}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
