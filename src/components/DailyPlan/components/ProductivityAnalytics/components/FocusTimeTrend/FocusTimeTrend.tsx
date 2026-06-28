import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import { Target } from 'lucide-react'
import type { FocusTimeTrendPoint } from '../../ProductivityAnalytics.types'

interface FocusTimeTrendProps {
  focusTimeTrend: FocusTimeTrendPoint[]
  avgFocusMinutes: number
  rangeDays: number
}

function formatMinutes(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function FocusTimeTrend(props: FocusTimeTrendProps): React.JSX.Element | null {
  const { focusTimeTrend, avgFocusMinutes, rangeDays } = props

  const hasData = focusTimeTrend.some((d) => d.focusMinutes > 0)
  if (!hasData) return null

  const chartData = focusTimeTrend.map((d) => ({
    ...d,
    focusHours: Math.round((d.focusMinutes / 60) * 10) / 10,
  }))

  const avgHours = Math.round((avgFocusMinutes / 60) * 10) / 10

  return (
    <div className="rounded-lg border border-border/40 bg-card p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Target className="size-3 text-green-500" />
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Focus Time Trend
          </span>
        </div>
        <span className="text-[9px] text-muted-foreground">
          avg {formatMinutes(avgFocusMinutes)}/day
        </span>
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="color-mix(in srgb, var(--color-border) 30%, transparent)"
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 9, fill: 'var(--color-muted-foreground)' }}
            tickLine={false}
            axisLine={false}
            interval={rangeDays <= 7 ? 0 : rangeDays <= 14 ? 1 : 4}
          />
          <YAxis
            tick={{ fontSize: 9, fill: 'var(--color-muted-foreground)' }}
            tickLine={false}
            axisLine={false}
            width={20}
            tickFormatter={(v: number) => `${v}h`}
          />
          <RechartsTooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              const point = payload[0].payload
              return (
                <div
                  className="rounded-lg border px-2.5 py-1.5 shadow-lg backdrop-blur-sm"
                  style={{
                    background: 'var(--color-popover)',
                    borderColor: 'color-mix(in srgb, var(--color-border) 50%, transparent)',
                    color: 'var(--color-popover-foreground)',
                  }}
                >
                  <p className="text-[10px] font-semibold mb-0.5">{label}</p>
                  <p className="text-[10px] text-emerald-500 font-medium">
                    {formatMinutes(point.focusMinutes)} focus time
                  </p>
                </div>
              )
            }}
          />
          <ReferenceLine
            y={avgHours}
            stroke="var(--color-muted-foreground)"
            strokeDasharray="4 4"
            strokeOpacity={0.5}
          />
          <Area
            type="monotone"
            dataKey="focusHours"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#focusGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
