import { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  BarChart3,
  CheckCircle2,
  Flame,
  PieChart,
  Trophy,
  TrendingUp,
  CalendarClock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AppLoaderGlyph } from '@/components/AppLoader'
import { useProductivityAnalyticsData } from './useProductivityAnalyticsData'
import { PriorityRadar } from './components/PriorityRadar'
import { TaskFlowInsights } from './components/TaskFlowInsights'
import { CompletionHeatmap } from './components/CompletionHeatmap'
import { VelocityPlanning } from './components/VelocityPlanning'
import { MeetingIntelligence } from './components/MeetingIntelligence'
import { FocusTimeTrend } from './components/FocusTimeTrend'
import { WeekdayRhythm } from './components/WeekdayRhythm'

type RangeOption = 7 | 14 | 30

const RANGE_OPTIONS: { value: RangeOption; label: string }[] = [
  { value: 7, label: '7d' },
  { value: 14, label: '14d' },
  { value: 30, label: '30d' },
]

export function ProductivityAnalytics(): React.JSX.Element {
  const [rangeDays, setRangeDays] = useState<RangeOption>(14)
  const data = useProductivityAnalyticsData(rangeDays)

  if (data.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <AppLoaderGlyph size={20} />
      </div>
    )
  }

  return (
    <div className="space-y-4 p-3 pt-4">
      {/* Range selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <BarChart3 className="size-3.5 text-primary" />
          Productivity
        </h3>
        <div className="flex gap-0.5 rounded-md bg-muted/50 p-0.5">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRangeDays(opt.value)}
              className={cn(
                "px-2 py-0.5 text-[10px] font-medium rounded transition-colors",
                rangeDays === opt.value
                  ? "bg-primary/15 text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard
          icon={<CheckCircle2 className="size-3 text-emerald-500" />}
          label="Completed"
          value={`${data.totalCompleted}/${data.totalTasks}`}
          subtext={`${data.overallCompletionPct}%`}
          color="emerald"
        />
        <StatCard
          icon={<CalendarClock className="size-3 text-blue-500" />}
          label="Meetings"
          value={String(data.totalMeetings)}
          subtext={formatMinutes(data.totalMeetingMinutes)}
          color="blue"
        />
        <StatCard
          icon={<Flame className="size-3 text-orange-500" />}
          label="Streak"
          value={`${data.currentStreak}d`}
          subtext={data.currentStreak > 0 ? "Keep going!" : "Start today"}
          color="orange"
        />
        <StatCard
          icon={<Trophy className="size-3 text-amber-500" />}
          label="Best Streak"
          value={`${data.bestStreak}d`}
          subtext="All-time"
          color="amber"
        />
      </div>

      {/* Task Flow & Attention — status funnel, overdue, remaining workload */}
      <TaskFlowInsights taskFlowInsights={data.taskFlowInsights} />

      {/* Completion bar chart with recharts */}
      <div className="rounded-lg border border-border/40 bg-card p-3">
        <div className="flex items-center gap-1.5 mb-2">
          <TrendingUp className="size-3 text-primary" />
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Daily Completion
          </span>
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart
            data={data.days.map((d) => ({
              ...d,
              remaining: Math.max(d.totalTasks - d.completedTasks, 0),
            }))}
            barCategoryGap="20%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="color-mix(in srgb, var(--color-border) 30%, transparent)"
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 9, fill: "var(--color-muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              interval={rangeDays <= 7 ? 0 : rangeDays <= 14 ? 1 : 4}
            />
            <YAxis
              tick={{ fontSize: 9, fill: "var(--color-muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              width={20}
              allowDecimals={false}
            />
            <RechartsTooltip
              cursor={{
                fill: "color-mix(in srgb, var(--color-primary) 8%, transparent)",
              }}
              offset={0}
              wrapperStyle={{
                width: "calc(100% + 20px)",
                left: -10,
                top: 0,
                position: "absolute",
                transform: "translateY(calc(-100% - 36px))",
                pointerEvents: "none",
              }}
              allowEscapeViewBox={{ x: true, y: true }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const entry = payload[0]?.payload;
                if (!entry) return null;
                const remaining = Math.max(
                  entry.totalTasks - entry.completedTasks,
                  0,
                );
                return (
                  <div
                    className="rounded-xl border px-3.5 py-3 shadow-xl backdrop-blur-sm w-full"
                    style={{
                      background: "var(--color-popover)",
                      borderColor:
                        "color-mix(in srgb, var(--color-border) 50%, transparent)",
                      color: "var(--color-popover-foreground)",
                    }}
                  >
                    <p className="text-xs font-semibold mb-2">{label}</p>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                          <span
                            className="inline-block size-2 rounded-full"
                            style={{ background: "#10b981" }}
                          />
                          Completed
                        </span>
                        <span
                          className="text-[11px] font-bold"
                          style={{ color: "#10b981" }}
                        >
                          {entry.completedTasks}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                          <span
                            className="inline-block size-2 rounded-full"
                            style={{ background: "#f59e0b" }}
                          />
                          Remaining
                        </span>
                        <span
                          className="text-[11px] font-bold"
                          style={{ color: "#f59e0b" }}
                        >
                          {remaining}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                          <span
                            className="inline-block size-2 rounded-full"
                            style={{
                              background: "var(--color-muted-foreground)",
                              opacity: 0.5,
                            }}
                          />
                          Total
                        </span>
                        <span className="text-[11px] font-bold">
                          {entry.totalTasks}
                        </span>
                      </div>

                      <div
                        className="my-1.5 h-px"
                        style={{
                          background:
                            "color-mix(in srgb, var(--color-border) 40%, transparent)",
                        }}
                      />

                      {/* Completion rate with mini progress bar */}
                      <div>
                        <div className="flex items-center justify-between gap-4 mb-1">
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                            <span
                              className="inline-block size-2 rounded-full"
                              style={{ background: "#3b82f6" }}
                            />
                            Rate
                          </span>
                          <span
                            className="text-[11px] font-bold"
                            style={{ color: "#3b82f6" }}
                          >
                            {entry.completionPct}%
                          </span>
                        </div>
                        <div
                          className="h-1 rounded-full overflow-hidden"
                          style={{
                            background:
                              "color-mix(in srgb, var(--color-muted-foreground) 12%, transparent)",
                          }}
                        >
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${entry.completionPct}%`,
                              background:
                                "linear-gradient(90deg, #10b981, #3b82f6)",
                            }}
                          />
                        </div>
                      </div>

                      {/* Meetings info */}
                      {entry.meetingCount > 0 && (
                        <>
                          <div
                            className="mt-0.5 h-px"
                            style={{
                              background:
                                "color-mix(in srgb, var(--color-border) 40%, transparent)",
                            }}
                          />
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                              <span
                                className="inline-block size-2 rounded-full"
                                style={{ background: "#8b5cf6" }}
                              />
                              Meetings
                            </span>
                            <span
                              className="text-[11px] font-bold"
                              style={{ color: "#8b5cf6" }}
                            >
                              {entry.meetingCount}
                              <span className="font-normal text-[9px] text-muted-foreground ml-1">
                                ({formatMinutes(entry.meetingMinutes)})
                              </span>
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              }}
            />
            {/* Single stacked bar: completed (green) + remaining (muted) */}
            <Bar
              dataKey="completedTasks"
              stackId="tasks"
              fill="#10b981"
              radius={[0, 0, 0, 0]}
              maxBarSize={24}
            />
            <Bar
              dataKey="remaining"
              stackId="tasks"
              fill="color-mix(in srgb, #f59e0b 25%, transparent)"
              radius={[3, 3, 0, 0]}
              maxBarSize={24}
            />
          </BarChart>
        </ResponsiveContainer>
        {/* Legend */}
        <div className="flex items-center gap-3 mt-1">
          <div className="flex items-center gap-1">
            <div className="size-2 rounded-full bg-emerald-500" />
            <span className="text-[9px] text-muted-foreground">Completed</span>
          </div>
          <div className="flex items-center gap-1">
            <div
              className="size-2 rounded-full"
              style={{
                background: "color-mix(in srgb, #f59e0b 25%, transparent)",
              }}
            />
            <span className="text-[9px] text-muted-foreground">Remaining</span>
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      {data.categoryBreakdown.length > 0 && (
        <div className="rounded-lg border border-border/40 bg-card p-3">
          <div className="flex items-center gap-1.5 mb-3">
            <PieChart className="size-3 text-primary" />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              By Category
            </span>
          </div>
          <div className="space-y-2">
            {data.categoryBreakdown.map((cat) => {
              const pct =
                cat.count > 0
                  ? Math.round((cat.completed / cat.count) * 100)
                  : 0;
              return (
                <div key={cat.categoryId ?? "none"} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="size-2 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-[11px] font-medium text-foreground">
                        {cat.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                      {cat.completed}/{cat.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: cat.color,
                        opacity: 0.7,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Priority Completion Radar */}
      <PriorityRadar priorityBreakdown={data.priorityBreakdown} />

      {/* Completion Heatmap — Peak Hours */}
      <CompletionHeatmap completionHeatmap={data.completionHeatmap} />

      {/* Task Velocity & Planning Score */}
      <VelocityPlanning
        avgVelocityHours={data.avgVelocityHours}
        planningScore={data.planningScore}
      />

      {/* Meeting Intelligence */}
      <MeetingIntelligence
        meetingTypeDistribution={data.meetingTypeDistribution}
        meetingCancelRate={data.meetingCancelRate}
        avgMeetingDuration={data.avgMeetingDuration}
        meetingLoadPct={data.meetingLoadPct}
        totalMeetings={data.totalMeetings}
      />

      {/* Focus Time Trend */}
      <FocusTimeTrend
        focusTimeTrend={data.focusTimeTrend}
        avgFocusMinutes={data.avgFocusMinutes}
        rangeDays={rangeDays}
      />

      {/* Weekly Rhythm */}
      <WeekdayRhythm weekdayAnalysis={data.weekdayAnalysis} />
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────

function formatMinutes(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function StatCard({
  icon,
  label,
  value,
  subtext,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  subtext: string
  color: string
}): React.JSX.Element {
  return (
    <div className={cn(
      'rounded-lg border border-border/40 bg-card p-2.5 space-y-1',
      `hover:border-${color}-500/30 transition-colors`,
    )}>
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-bold text-foreground tabular-nums leading-none">
          {value}
        </span>
        <span className="text-[10px] text-muted-foreground">{subtext}</span>
      </div>
    </div>
  )
}
