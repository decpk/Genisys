import { CalendarDays, Crown } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { StatsDayOfWeekPatternTooltip } from './components/StatsDayOfWeekPatternTooltip'
import {
  STATS_DAY_OF_WEEK_PATTERN_CHART as CHART,
  STATS_DAY_OF_WEEK_PATTERN_STYLES as S,
} from './StatsDayOfWeekPattern.styles'
import type { StatsDayOfWeekPatternProps } from './StatsDayOfWeekPattern.types'
import { useStatsDayOfWeekPatternData } from './useStatsDayOfWeekPatternData'

export function StatsDayOfWeekPattern(
  props: StatsDayOfWeekPatternProps,
): React.JSX.Element {
  const data = useStatsDayOfWeekPatternData(props)

  let body: React.ReactNode

  if (!data.hasData) {
    body = (
      <div className={S.empty}>
        Not enough data to show day-of-week patterns yet.
      </div>
    )
  } else {
    body = (
      <div className={S.chartWrap}>
        <ResponsiveContainer width="100%" height={CHART.height}>
          <BarChart
            data={data.stats}
            margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
          >
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
              interval={0}
            />
            <YAxis
              tick={{ fontSize: 9, fill: CHART.axisColor }}
              tickLine={false}
              axisLine={false}
              width={24}
              tickFormatter={(v: number) => `${v}m`}
            />
            <RechartsTooltip
              cursor={{ fill: 'var(--color-muted)', opacity: 0.15 }}
              content={<StatsDayOfWeekPatternTooltip />}
            />
            <Bar dataKey="avgMinutes" radius={[3, 3, 0, 0]}>
              {data.stats.map((stat, index) => {
                const isBest = index === data.bestIndex
                const fill = isBest
                  ? 'var(--color-primary)'
                  : 'color-mix(in srgb, var(--color-primary) 35%, transparent)'
                return <Cell key={stat.label} fill={fill} />
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  let bestNode: React.ReactNode = null
  if (data.bestLabel) {
    bestNode = (
      <span className={S.headerRight}>
        <Crown className="size-2.5 text-primary" />
        Best: <span className="text-foreground font-medium">{data.bestLabel}</span>
      </span>
    )
  }

  return (
    <section className={S.section}>
      <div className={S.header}>
        <div className={S.headerLeft}>
          <CalendarDays className="size-3 text-primary" />
          <span>By day of week</span>
        </div>
        {bestNode}
      </div>
      {body}
    </section>
  )
}
