import type { StatsTotalsCardProps } from './StatsTotalsCard.types'

interface Stat {
  label: string
  value: string
}

export function StatsTotalsCard(
  props: StatsTotalsCardProps,
): React.JSX.Element {
  const { totals } = props

  const items: Stat[] = [
    { label: 'Total minutes', value: String(totals.totalFocusMinutes) },
    { label: 'Sessions', value: String(totals.totalSessions) },
    { label: 'Current streak', value: `${totals.currentStreak}d` },
    { label: 'Longest streak', value: `${totals.longestStreak}d` },
  ]

  return (
    <section className="grid grid-cols-2 gap-2 px-3 py-3 border-b border-border/40">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex flex-col rounded-md border border-border/40 bg-background px-2 py-2"
        >
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {item.label}
          </span>
          <span className="text-base font-semibold tabular-nums">
            {item.value}
          </span>
        </div>
      ))}
    </section>
  )
}
