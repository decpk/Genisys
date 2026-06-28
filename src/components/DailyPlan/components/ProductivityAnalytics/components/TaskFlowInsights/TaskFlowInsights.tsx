import { Activity, AlertTriangle, Loader2, Clock } from 'lucide-react'
import type { TaskFlowInsights as TaskFlowInsightsData } from '../../ProductivityAnalytics.types'

interface TaskFlowInsightsProps {
  taskFlowInsights: TaskFlowInsightsData
}

const STATUS_META = [
  { key: 'completed', label: 'Completed', color: '#10b981' },
  { key: 'in_progress', label: 'In Progress', color: '#f59e0b' },
  { key: 'todo', label: 'To Do', color: '#94a3b8' },
] as const

function formatMinutes(mins: number): string {
  if (mins <= 0) return '0m'
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function TaskFlowInsights(
  props: TaskFlowInsightsProps,
): React.JSX.Element | null {
  const { taskFlowInsights } = props
  const { statusCounts, total, overdueCount, remainingWorkloadMinutes } =
    taskFlowInsights

  if (total === 0) return null

  return (
    <div className="rounded-lg border border-border/40 bg-card p-3">
      <div className="flex items-center gap-1.5 mb-3">
        <Activity className="size-3 text-primary" />
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Task Flow
        </span>
      </div>

      {/* Segmented status bar */}
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted/40">
        {STATUS_META.map((s) => {
          const count = statusCounts[s.key]
          if (count === 0) return null
          const pct = (count / total) * 100
          return (
            <div
              key={s.key}
              className="h-full transition-all"
              style={{ width: `${pct}%`, backgroundColor: s.color }}
              title={`${s.label}: ${count}`}
            />
          )
        })}
      </div>

      {/* Status legend with counts */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
        {STATUS_META.map((s) => {
          const count = statusCounts[s.key]
          const pct = total > 0 ? Math.round((count / total) * 100) : 0
          return (
            <div key={s.key} className="flex items-center gap-1.5">
              <span
                className="size-2 rounded-full shrink-0"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-[10px] text-muted-foreground">
                {s.label}
                <span className="font-semibold text-foreground ml-1 tabular-nums">
                  {count}
                </span>
                <span className="text-muted-foreground/60 ml-1 tabular-nums">
                  ({pct}%)
                </span>
              </span>
            </div>
          )
        })}
      </div>

      {/* Attention callouts */}
      <div className="grid grid-cols-3 gap-2 mt-3">
        <FlowStat
          icon={
            <AlertTriangle
              className={
                overdueCount > 0
                  ? 'size-3 text-red-500'
                  : 'size-3 text-muted-foreground'
              }
            />
          }
          label="Overdue"
          value={String(overdueCount)}
          accent={overdueCount > 0 ? '#ef4444' : undefined}
        />
        <FlowStat
          icon={<Loader2 className="size-3 text-amber-500" />}
          label="In Progress"
          value={String(statusCounts.in_progress)}
          accent={statusCounts.in_progress > 0 ? '#f59e0b' : undefined}
        />
        <FlowStat
          icon={<Clock className="size-3 text-cyan-500" />}
          label="Remaining"
          value={formatMinutes(remainingWorkloadMinutes)}
        />
      </div>
    </div>
  )
}

function FlowStat({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: string
  accent?: string
}): React.JSX.Element {
  return (
    <div className="rounded-md border border-border/40 bg-muted/20 p-2 flex flex-col gap-1">
      <div className="flex items-center gap-1">
        {icon}
        <span className="text-[8px] font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
      </div>
      <span
        className="text-sm font-bold tabular-nums leading-none"
        style={{ color: accent ?? 'var(--color-foreground)' }}
      >
        {value}
      </span>
    </div>
  )
}
