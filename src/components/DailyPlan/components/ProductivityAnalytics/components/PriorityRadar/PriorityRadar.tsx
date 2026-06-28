import { Shield } from 'lucide-react'
import type { PriorityBreakdown } from '../../ProductivityAnalytics.types'

interface PriorityRadarProps {
  priorityBreakdown: PriorityBreakdown[]
}

const PRIORITY_COLORS: Record<string, string> = {
  low: '#06b6d4',
  medium: '#3b82f6',
  high: '#f97316',
  urgent: '#ef4444',
}

// Render order: most important on top.
const DISPLAY_ORDER = ['urgent', 'high', 'medium', 'low']

export function PriorityRadar(props: PriorityRadarProps): React.JSX.Element | null {
  const { priorityBreakdown } = props

  const hasData = priorityBreakdown.some((p) => p.total > 0)
  if (!hasData) return null

  const rows = DISPLAY_ORDER.map((priority) =>
    priorityBreakdown.find((b) => b.priority === priority),
  ).filter((p): p is PriorityBreakdown => Boolean(p))

  return (
    <div className="rounded-lg border border-border/40 bg-card p-3">
      <div className="flex items-center gap-1.5 mb-3">
        <Shield className="size-3 text-primary" />
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Priority Completion
        </span>
      </div>
      <div className="flex flex-col gap-2.5">
        {rows.map((p) => {
          const color = PRIORITY_COLORS[p.priority] ?? '#8b5cf6'
          const pct = p.total > 0 ? p.pct : 0
          return (
            <div key={p.priority} className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span
                    className="size-2 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-[11px] font-medium text-foreground">
                    {p.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground tabular-nums">
                    {p.completed}/{p.total}
                  </span>
                  <span
                    className="text-[10px] font-semibold tabular-nums"
                    style={{ color }}
                  >
                    {pct}%
                  </span>
                </div>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted/50 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
