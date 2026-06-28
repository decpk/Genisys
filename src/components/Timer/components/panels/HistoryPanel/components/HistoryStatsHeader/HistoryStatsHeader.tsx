import { Clock, Hash, History } from 'lucide-react'

import { formatSessionDuration } from '../../utils/formatSessionDuration'

import type { HistoryStatsHeaderProps } from './HistoryStatsHeader.types'

export function HistoryStatsHeader(
  props: HistoryStatsHeaderProps,
): React.JSX.Element {
  const { stats } = props
  const todayMinSec = stats.minutesToday * 60

  return (
    <section className="px-3 pt-3">
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-border/50 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-2.5">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Clock size={10} className="text-amber-500" />
            Today
          </div>
          <div className="mt-1 text-lg font-bold tabular-nums leading-none">
            {formatSessionDuration(todayMinSec)}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            {stats.sessionsToday} session{stats.sessionsToday === 1 ? '' : 's'}
          </div>
        </div>
        <div className="rounded-xl border border-border/50 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 p-2.5">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Hash size={10} className="text-emerald-500" />
            Total
          </div>
          <div className="mt-1 text-lg font-bold tabular-nums leading-none">
            {stats.sessionsTotal}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">sessions</div>
        </div>
        <div className="rounded-xl border border-border/50 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 p-2.5">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <History size={10} className="text-violet-500" />
            Logged
          </div>
          <div className="mt-1 text-lg font-bold tabular-nums leading-none">
            {formatSessionDuration(stats.minutesTotal * 60)}
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">all time</div>
        </div>
      </div>
    </section>
  )
}
