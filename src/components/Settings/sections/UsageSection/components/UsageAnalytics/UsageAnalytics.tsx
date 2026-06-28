import { memo } from 'react'

import { TotalsCards } from '../TotalsCards'
import { PerAppBarChart } from '../PerAppBarChart'
import { PerAppPieChart } from '../PerAppPieChart'
import { TrendChart } from '../TrendChart'
import { MostUsedTable } from '../MostUsedTable'
import { HourlyHeatmap } from '../HourlyHeatmap'
import { AvgSessionLength } from '../AvgSessionLength'
import { UsagePanel } from '../UsagePanel'
import type { UsageAnalyticsProps } from './UsageAnalytics.types'

export const UsageAnalytics = memo(function UsageAnalytics(
  props: UsageAnalyticsProps,
): React.JSX.Element {
  const { stats } = props

  return (
    <div className="flex flex-col gap-4">
      <TotalsCards totals={stats.totals} sessionTotals={stats.sessionTotals} />

      <UsagePanel title="Activity over time">
        <TrendChart perDay={stats.perDay} />
      </UsagePanel>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <UsagePanel title="Active time by app">
          <PerAppBarChart perApp={stats.perApp} />
        </UsagePanel>
        <UsagePanel title="Time share by app">
          <PerAppPieChart perApp={stats.perApp} />
        </UsagePanel>
      </div>

      <UsagePanel title="Active time by hour">
        <HourlyHeatmap perHour={stats.perHour} />
      </UsagePanel>

      <UsagePanel title="Most used apps">
        <MostUsedTable perApp={stats.perApp} />
      </UsagePanel>

      <UsagePanel title="Average session length">
        <AvgSessionLength perApp={stats.perApp} />
      </UsagePanel>
    </div>
  )
})
