import type { StatsPerTagBreakdownProps } from './StatsPerTagBreakdown.types'

export function StatsPerTagBreakdown(
  props: StatsPerTagBreakdownProps,
): React.JSX.Element {
  const { perTag } = props

  let body: React.ReactNode = null
  if (perTag.length === 0) {
    body = (
      <div className="text-[10px] text-muted-foreground">
        No tagged sessions yet.
      </div>
    )
  } else {
    const max = Math.max(1, ...perTag.map((p) => p.minutes))
    body = perTag.map((p) => {
      const widthPct = `${Math.round((p.minutes / max) * 100)}%`
      return (
        <div key={p.label} className="flex items-center gap-2 text-xs">
          <span className="w-20 truncate">{p.label}</span>
          <div className="flex-1 h-2 rounded-full bg-accent/30 overflow-hidden">
            <div className="h-full bg-primary" style={{ width: widthPct }} />
          </div>
          <span className="tabular-nums text-muted-foreground w-10 text-right">
            {p.minutes}m
          </span>
        </div>
      )
    })
  }

  return (
    <section className="flex flex-col gap-2 px-3 py-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        By tag
      </div>
      <div className="flex flex-col gap-1.5">{body}</div>
    </section>
  )
}
