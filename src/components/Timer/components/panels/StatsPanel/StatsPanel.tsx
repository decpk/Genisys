import { StatsDayOfWeekPattern } from './components/StatsDayOfWeekPattern'
import { StatsGoalProgress } from './components/StatsGoalProgress'
import { StatsHeatmapGrid } from './components/StatsHeatmapGrid'
import { StatsHighlights } from './components/StatsHighlights'
import { StatsPerTagBreakdown } from './components/StatsPerTagBreakdown'
import { StatsTagShareDonut } from './components/StatsTagShareDonut'
import { StatsTotalsCard } from './components/StatsTotalsCard'
import { StatsTrendArea } from './components/StatsTrendArea'
import { StatsWeeklyBars } from './components/StatsWeeklyBars'
import { useStatsPanelData } from './hooks/useStatsPanelData'

export function StatsPanel(): React.JSX.Element {
  const data = useStatsPanelData()

  let body: React.ReactNode = null
  if (data.isLoading) {
    body = (
      <div className="p-4 text-xs text-muted-foreground">Loading stats…</div>
    )
  } else if (data.error) {
    body = <div className="p-4 text-xs text-destructive">{data.error}</div>
  } else {
    const stats = data.effectiveStats
    body = (
      <>
        <StatsTotalsCard totals={stats.totals} />
        <StatsGoalProgress />
        <StatsWeeklyBars weekly={stats.weekly} />
        <StatsTrendArea cells={stats.heatmap} />
        <StatsHeatmapGrid cells={stats.heatmap} />
        <StatsDayOfWeekPattern cells={stats.heatmap} />
        <StatsTagShareDonut perTag={stats.perTag} />
        <StatsPerTagBreakdown perTag={stats.perTag} />
        <StatsHighlights
          totals={stats.totals}
          heatmap={stats.heatmap}
          perTag={stats.perTag}
        />
      </>
    )
  }

  return <div className="flex flex-col h-full overflow-y-auto">{body}</div>
}
