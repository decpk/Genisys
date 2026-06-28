import { Flame, Trophy } from 'lucide-react'

import type { StreakHeaderProps } from './StreakHeader.types'

export function StreakHeader(props: StreakHeaderProps): React.JSX.Element {
  const { streakDays, earnedCount, totalCount } = props

  return (
    <section className="px-3 pt-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-border/50 bg-gradient-to-br from-orange-500/10 to-amber-500/5 p-3">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Flame size={11} className="text-orange-500" />
            Streak
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold tabular-nums">{streakDays}</span>
            <span className="text-xs text-muted-foreground">days</span>
          </div>
        </div>
        <div className="rounded-xl border border-border/50 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 p-3">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Trophy size={11} className="text-violet-500" />
            Milestones
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold tabular-nums">{earnedCount}</span>
            <span className="text-xs text-muted-foreground">of {totalCount}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
