import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts'

import {
  CHART_HEIGHT,
  LEGEND_STYLE,
  PIE_NAME_KEY_DEFAULT,
  PIE_VALUE_KEY_DEFAULT,
  TOOLTIP_CONTENT_STYLE,
} from '../RechartsViewer.constants'
import { pickPaletteColor } from '../utils/pickPaletteColor'
import type { ChartViewProps } from '../RechartsViewer.types'

export function PieChartView(props: ChartViewProps): React.JSX.Element {
  const { spec } = props
  const nameKey = spec.nameKey ?? PIE_NAME_KEY_DEFAULT
  const valueKey = spec.valueKey ?? PIE_VALUE_KEY_DEFAULT
  const colors = spec.colors

  return (
    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
      <PieChart>
        <RechartsTooltip contentStyle={TOOLTIP_CONTENT_STYLE} />
        <Legend wrapperStyle={LEGEND_STYLE} />
        <Pie
          data={spec.data}
          dataKey={valueKey}
          nameKey={nameKey}
          cx="50%"
          cy="50%"
          outerRadius={90}
          innerRadius={48}
          paddingAngle={2}
          isAnimationActive={false}
        >
          {spec.data.map((_, i) => (
            <Cell key={i} fill={pickPaletteColor(i, colors?.[i])} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  )
}
