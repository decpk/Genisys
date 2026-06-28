import { DailyGoalCard } from './components/DailyGoalCard'
import { MilestoneBadgeGrid } from './components/MilestoneBadgeGrid'
import { PerTaskGoalsList } from './components/PerTaskGoalsList'
import { StreakHeader } from './components/StreakHeader'
import { WeeklyGoalCard } from './components/WeeklyGoalCard'
import { useGoalsPanelData } from './hooks/useGoalsPanelData'

const MILESTONE_TOTAL = 8

export function GoalsPanel(): React.JSX.Element {
  const data = useGoalsPanelData()

  const weeklyTotal = data.weeklyMinutes.reduce((acc, n) => acc + (n ?? 0), 0)
  const milestoneKeys = data.milestones.map((m) => m.key)

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-muted/20">
      <StreakHeader
        streakDays={data.streakDays}
        earnedCount={milestoneKeys.length}
        totalCount={MILESTONE_TOTAL}
      />
      <DailyGoalCard
        achievedMinutes={data.todaysFocusMinutes}
        targetMinutes={data.goals.dailyMinutesTarget}
        onTargetChange={(v) => data.updateGoals({ dailyMinutesTarget: v })}
      />
      <WeeklyGoalCard
        achievedMinutes={weeklyTotal}
        targetMinutes={data.goals.weeklyMinutesTarget}
        onTargetChange={(v) => data.updateGoals({ weeklyMinutesTarget: v })}
      />
      <PerTaskGoalsList
        targets={data.goals.perTaskTargets}
        onChange={(next) => data.updateGoals({ perTaskTargets: next })}
      />
      <MilestoneBadgeGrid achievedKeys={milestoneKeys} />
    </div>
  )
}
