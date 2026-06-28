import { Timer, CalendarCheck2 } from 'lucide-react'

interface VelocityPlanningProps {
  avgVelocityHours: number
  planningScore: number
}

function formatVelocity(hours: number): string {
  if (hours === 0) return '—'
  if (hours < 1) return `${Math.round(hours * 60)}m`
  if (hours < 24) return `${hours}h`
  const days = Math.round(hours / 24 * 10) / 10
  return `${days}d`
}

function getVelocityInsight(hours: number): string {
  if (hours === 0) return 'No data yet'
  if (hours < 2) return 'Lightning fast'
  if (hours < 8) return 'Same-day closer'
  if (hours < 24) return 'Steady pace'
  if (hours < 72) return 'Takes a few days'
  return 'Long-running tasks'
}

function getPlanningInsight(score: number): string {
  if (score === 0) return 'All reactive'
  if (score < 25) return 'Mostly reactive'
  if (score < 50) return 'Mixed approach'
  if (score < 75) return 'Good planner'
  return 'Excellent planner'
}

export function VelocityPlanning(props: VelocityPlanningProps): React.JSX.Element {
  const { avgVelocityHours, planningScore } = props

  const velocityDisplay = formatVelocity(avgVelocityHours)
  const velocityInsight = getVelocityInsight(avgVelocityHours)
  const planningInsight = getPlanningInsight(planningScore)

  // SVG circular progress for planning score
  const radius = 22
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (planningScore / 100) * circumference

  return (
    <div className="grid grid-cols-2 gap-2">
      {/* Velocity card */}
      <div className="rounded-lg border border-border/40 bg-card p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Timer className="size-3 text-violet-500" />
          <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
            Avg Velocity
          </span>
        </div>
        <div className="flex items-baseline gap-1 mb-0.5">
          <span className="text-lg font-bold text-foreground tabular-nums leading-none">
            {velocityDisplay}
          </span>
        </div>
        <p className="text-[9px] text-muted-foreground">
          {velocityInsight}
        </p>
        <p className="text-[8px] text-muted-foreground/50 mt-1">
          Creation → completion
        </p>
      </div>

      {/* Planning score card */}
      <div className="rounded-lg border border-border/40 bg-card p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <CalendarCheck2 className="size-3 text-cyan-500" />
          <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
            Planning
          </span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="52" height="52" viewBox="0 0 52 52" className="shrink-0">
            <circle
              cx="26" cy="26" r={radius}
              fill="none"
              stroke="color-mix(in srgb, var(--color-muted-foreground) 12%, transparent)"
              strokeWidth="4"
            />
            <circle
              cx="26" cy="26" r={radius}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform="rotate(-90 26 26)"
              className="transition-all duration-700"
            />
            <text
              x="26" y="26"
              textAnchor="middle"
              dominantBaseline="central"
              className="text-[11px] font-bold"
              fill="var(--color-foreground)"
            >
              {planningScore}%
            </text>
          </svg>
          <div>
            <p className="text-[9px] text-muted-foreground leading-tight">
              {planningInsight}
            </p>
            <p className="text-[8px] text-muted-foreground/50 mt-0.5">
              Tasks planned ahead
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
