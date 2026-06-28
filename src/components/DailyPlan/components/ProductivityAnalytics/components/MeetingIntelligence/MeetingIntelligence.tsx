import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts'
import { Users, Clock, XCircle, Gauge } from 'lucide-react'
import type { MeetingTypeDistribution } from '../../ProductivityAnalytics.types'

interface MeetingIntelligenceProps {
  meetingTypeDistribution: MeetingTypeDistribution[]
  meetingCancelRate: number
  avgMeetingDuration: number
  meetingLoadPct: number
  totalMeetings: number
}

function formatMinutes(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function MeetingIntelligence(props: MeetingIntelligenceProps): React.JSX.Element | null {
  const { meetingTypeDistribution, meetingCancelRate, avgMeetingDuration, meetingLoadPct, totalMeetings } = props

  if (totalMeetings === 0) return null

  return (
    <div className="rounded-lg border border-border/40 bg-card p-3">
      <div className="flex items-center gap-1.5 mb-3">
        <Users className="size-3 text-primary" />
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Meeting Intelligence
        </span>
      </div>

      {/* Donut chart */}
      {meetingTypeDistribution.length > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <div className="w-[100px] h-[100px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={meetingTypeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={42}
                  paddingAngle={2}
                  dataKey="count"
                  nameKey="label"
                  strokeWidth={0}
                >
                  {meetingTypeDistribution.map((entry) => (
                    <Cell key={entry.type} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const d = payload[0].payload as MeetingTypeDistribution
                    return (
                      <div
                        className="rounded-lg border px-2.5 py-1.5 shadow-lg backdrop-blur-sm text-[10px]"
                        style={{
                          background: 'var(--color-popover)',
                          borderColor: 'color-mix(in srgb, var(--color-border) 50%, transparent)',
                          color: 'var(--color-popover-foreground)',
                        }}
                      >
                        <div className="font-semibold">{d.label}</div>
                        <div className="text-muted-foreground">
                          {d.count} meeting{d.count !== 1 ? 's' : ''} · {formatMinutes(d.minutes)}
                        </div>
                      </div>
                    )
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex-1 space-y-1">
            {meetingTypeDistribution.slice(0, 5).map((entry) => (
              <div key={entry.type} className="flex items-center gap-1.5">
                <div
                  className="size-2 rounded-full shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-[9px] text-muted-foreground truncate flex-1">
                  {entry.label}
                </span>
                <span className="text-[9px] text-foreground font-medium tabular-nums">
                  {entry.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key metrics row */}
      <div className="grid grid-cols-3 gap-1.5">
        <MiniMetric
          icon={<Gauge className="size-2.5 text-orange-500" />}
          label="Load"
          value={`${meetingLoadPct}%`}
          sublabel="of workday"
        />
        <MiniMetric
          icon={<XCircle className="size-2.5 text-red-400" />}
          label="Cancel"
          value={`${meetingCancelRate}%`}
          sublabel="cancelled"
        />
        <MiniMetric
          icon={<Clock className="size-2.5 text-blue-400" />}
          label="Avg Len"
          value={formatMinutes(avgMeetingDuration)}
          sublabel="per meeting"
        />
      </div>
    </div>
  )
}

function MiniMetric(props: {
  icon: React.ReactNode
  label: string
  value: string
  sublabel: string
}): React.JSX.Element {
  const { icon, label, value, sublabel } = props

  return (
    <div className="rounded-md bg-muted/30 p-2 text-center">
      <div className="flex items-center justify-center gap-1 mb-1">
        {icon}
        <span className="text-[8px] font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="text-sm font-bold text-foreground tabular-nums leading-none mb-0.5">
        {value}
      </div>
      <div className="text-[7px] text-muted-foreground/60">
        {sublabel}
      </div>
    </div>
  )
}
