import { PieChart as PieChartIcon } from 'lucide-react'
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts'

import { StatsTagShareDonutLegend } from './components/StatsTagShareDonutLegend'
import { StatsTagShareDonutTooltip } from './components/StatsTagShareDonutTooltip'
import {
  STATS_TAG_SHARE_DONUT_CHART as CHART,
  STATS_TAG_SHARE_DONUT_STYLES as S,
} from './StatsTagShareDonut.styles'
import type { StatsTagShareDonutProps } from './StatsTagShareDonut.types'
import { useStatsTagShareDonutData } from './useStatsTagShareDonutData'

export function StatsTagShareDonut(
  props: StatsTagShareDonutProps,
): React.JSX.Element {
  const data = useStatsTagShareDonutData(props)

  let body: React.ReactNode

  if (!data.hasData) {
    body = <div className={S.empty}>No tagged sessions yet.</div>
  } else {
    const donutStyle: React.CSSProperties = {
      width: CHART.size,
      height: CHART.size,
    }
    body = (
      <div className={S.body}>
        <div className={S.donutWrap} style={donutStyle}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.slices}
                cx="50%"
                cy="50%"
                innerRadius={CHART.innerRadius}
                outerRadius={CHART.outerRadius}
                paddingAngle={CHART.paddingAngle}
                dataKey="minutes"
                nameKey="label"
                strokeWidth={0}
              >
                {data.slices.map((slice) => (
                  <Cell key={slice.key} fill={slice.color} />
                ))}
              </Pie>
              <RechartsTooltip content={<StatsTagShareDonutTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className={S.legendWrap}>
          <StatsTagShareDonutLegend slices={data.slices} />
        </div>
      </div>
    )
  }

  return (
    <section className={S.section}>
      <div className={S.header}>
        <PieChartIcon className="size-3 text-primary" />
        <span>Tag share</span>
      </div>
      {body}
    </section>
  )
}
