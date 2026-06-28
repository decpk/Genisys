import { Activity } from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { formatMinutesShort } from '../../utils/formatMinutesShort'
import { StatsTrendAreaTooltip } from './components/StatsTrendAreaTooltip'
import {
  STATS_TREND_AREA_CHART as CHART,
  STATS_TREND_AREA_STYLES as S,
} from './StatsTrendArea.styles'
import type { StatsTrendAreaProps } from './StatsTrendArea.types'
import { useStatsTrendAreaData } from './useStatsTrendAreaData'

export function StatsTrendArea(
  props: StatsTrendAreaProps,
): React.JSX.Element {
  const data = useStatsTrendAreaData(props)

  let body: React.ReactNode
  if (!data.hasData) {
    body = <div className={S.empty}>No focus minutes in the last 30 days.</div>
  } else {
    body = (
      <div className={S.chartWrap}>
        <ResponsiveContainer width="100%" height={CHART.height}>
          <AreaChart
            data={data.series}
            margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient
                id={CHART.gradientId}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--color-primary)"
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-primary)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={CHART.gridStroke}
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 9, fill: CHART.axisColor }}
              tickLine={false}
              axisLine={false}
              interval={4}
            />
            <YAxis
              tick={{ fontSize: 9, fill: CHART.axisColor }}
              tickLine={false}
              axisLine={false}
              width={24}
              tickFormatter={(v: number) => `${v}m`}
            />
            <RechartsTooltip
              cursor={{
                stroke: CHART.gridStroke,
                strokeDasharray: '3 3',
              }}
              content={<StatsTrendAreaTooltip />}
            />
            <ReferenceLine
              y={data.averageMinutes}
              stroke={CHART.refLineColor}
              strokeDasharray="4 4"
              strokeOpacity={0.5}
            />
            <Area
              type="monotone"
              dataKey="minutes"
              stroke="var(--color-primary)"
              strokeWidth={2}
              fill={`url(#${CHART.gradientId})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    )
  }

  const avgLabel = `avg ${formatMinutesShort(data.averageMinutes)}/day`

  return (
    <section className={S.section}>
      <div className={S.header}>
        <div className={S.headerLeft}>
          <Activity className="size-3 text-primary" />
          <span>30-day trend</span>
        </div>
        <span className={S.headerRight}>{avgLabel}</span>
      </div>
      {body}
    </section>
  )
}
