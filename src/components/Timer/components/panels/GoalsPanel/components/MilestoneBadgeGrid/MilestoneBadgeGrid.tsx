import { MilestoneBadge } from '../MilestoneBadge'

import type { MilestoneBadgeGridProps } from './MilestoneBadgeGrid.types'

const ALL_KEYS = [
  'first-session',
  '50-sessions',
  '100-sessions',
  '10h-focus',
  '7-day-streak',
  '30-day-streak',
  'daily-goal-met',
  'weekly-goal-met',
]

export function MilestoneBadgeGrid(
  props: MilestoneBadgeGridProps,
): React.JSX.Element {
  const { achievedKeys } = props
  const earned = new Set(achievedKeys)

  return (
    <section className="px-3 pt-3 pb-4">
      <div className="rounded-xl border border-border/50 bg-card p-3.5">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Milestones
          </div>
          <span className="text-[10px] tabular-nums text-muted-foreground">
            {earned.size}/{ALL_KEYS.length}
          </span>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {ALL_KEYS.map((k) => (
            <MilestoneBadge key={k} badgeKey={k} achieved={earned.has(k)} />
          ))}
        </div>
      </div>
    </section>
  )
}
