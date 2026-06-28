import { useState } from 'react'
import { ListChecks, CalendarClock, Target, Clock, Pencil, Info, ClipboardCheck } from 'lucide-react'
import type { DPTask, DPMeeting, DPDailyEntry, DPReview } from '../../DailyPlan.types'
import { formatTime } from '../../utils/formatTime'
import { getEffectiveWorkHours } from '../../utils/getEffectiveWorkHours'
import { useSettingsStore } from '@/store/settings-store'
import { WorkHoursDialog } from '../WorkHoursDialog'
import { Tooltip } from '@/components/Tooltip'
import { IconButton } from '@/components/ui/icon-button'

interface DayOverviewProps {
  tasks: DPTask[]
  reviews: DPReview[]
  meetings: DPMeeting[]
  dailyEntry: DPDailyEntry | undefined
}

function getMeetingTotalMinutes(meetings: DPMeeting[]): number {
  let total = 0
  for (const m of meetings) {
    // Exclude cancelled and no_show meetings from duration
    if (m.status === 'cancelled' || m.status === 'no_show') continue
    const [sh, sm] = m.startTime.split(':').map(Number)
    const [eh, em] = m.endTime.split(':').map(Number)
    total += (eh * 60 + em) - (sh * 60 + sm)
  }
  return Math.max(total, 0)
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function formatMinutes(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function DayOverview(props: DayOverviewProps): React.JSX.Element {
  const { tasks, reviews, meetings, dailyEntry } = props

  const [workHoursOpen, setWorkHoursOpen] = useState(false)

  const completed = tasks.filter((t) => t.status === 'completed').length
  const total = tasks.length
  const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0

  const reviewCompleted = reviews.filter((r) => r.status === 'completed').length
  const reviewTotal = reviews.length
  const reviewPct = reviewTotal > 0 ? Math.round((reviewCompleted / reviewTotal) * 100) : 0

  const meetingMinutes = getMeetingTotalMinutes(meetings)
  const activeMeetings = meetings.filter((m) => m.status !== 'cancelled' && m.status !== 'no_show')

  const dpWorkStartTime = useSettingsStore((s) => s.dpWorkStartTime)
  const dpWorkEndTime = useSettingsStore((s) => s.dpWorkEndTime)
  const dpLunchStartTime = useSettingsStore((s) => s.dpLunchStartTime)
  const dpLunchEndTime = useSettingsStore((s) => s.dpLunchEndTime)

  const effective = getEffectiveWorkHours(dailyEntry, {
    workStartTime: dpWorkStartTime,
    workEndTime: dpWorkEndTime,
    lunchStartTime: dpLunchStartTime,
    lunchEndTime: dpLunchEndTime,
  })

  const workStart = effective.workStartTime
  const workEnd = effective.workEndTime
  const lunchStart = effective.lunchStartTime
  const lunchEnd = effective.lunchEndTime
  const hasWorkHours = workStart !== null || workEnd !== null

  const totalWorkMinutes = workStart && workEnd
    ? timeToMinutes(workEnd) - timeToMinutes(workStart)
    : 0
  const lunchMinutes = lunchStart && lunchEnd
    ? timeToMinutes(lunchEnd) - timeToMinutes(lunchStart)
    : 0
  const workdayMinutes = Math.max(totalWorkMinutes - lunchMinutes, 0)
  const focusMinutes = Math.max(workdayMinutes - meetingMinutes, 0)

  // Check if showing global defaults (entry has no per-day values but globals are set)
  const isUsingGlobalWork = hasWorkHours
    && dailyEntry?.workStartTime === undefined || dailyEntry?.workStartTime === null
    && dailyEntry?.workEndTime === undefined || dailyEntry?.workEndTime === null
    && (dpWorkStartTime !== null || dpWorkEndTime !== null)

  const workHoursSummary = hasWorkHours
    ? `${workStart ? formatTime(workStart) : '12:00 AM'} – ${workEnd ? formatTime(workEnd) : '11:59 PM'}`
    : 'Not set'

  const lunchSummary = lunchStart && lunchEnd
    ? `Lunch ${formatTime(lunchStart)} – ${formatTime(lunchEnd)}`
    : null

  const meetingPct = workdayMinutes > 0 ? Math.min((meetingMinutes / workdayMinutes) * 100, 100) : 0
  const focusPct = workdayMinutes > 0 ? Math.min((focusMinutes / workdayMinutes) * 100, 100) : 0

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Tasks */}
        <div className="relative overflow-hidden rounded-xl bg-card border border-border/40 p-4 hover:border-primary/30 transition-all duration-300 group/card">
          <ListChecks className="absolute -top-1.5 -right-1.5 size-14 text-primary/[0.04] rotate-12 transition-all duration-500 group-hover/card:text-primary/[0.07] group-hover/card:rotate-6" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center justify-center size-7 rounded-lg bg-primary/10">
                <ListChecks className="size-3.5 text-primary" />
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                Tasks
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 mb-0.5">
              <span className="text-2xl font-bold text-foreground tabular-nums leading-none">
                {completed}
              </span>
              <span className="text-sm text-muted-foreground/70 font-medium">
                / {total}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mb-2.5">
              {progressPct}% complete
            </p>
            <div className="h-1 rounded-full bg-muted/60 overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="relative overflow-hidden rounded-xl bg-card border border-border/40 p-4 hover:border-violet-500/30 transition-all duration-300 group/card">
          <ClipboardCheck className="absolute -top-1.5 -right-1.5 size-14 text-violet-500/[0.04] rotate-12 transition-all duration-500 group-hover/card:text-violet-500/[0.07] group-hover/card:rotate-6" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center justify-center size-7 rounded-lg bg-violet-500/10">
                <ClipboardCheck className="size-3.5 text-violet-500" />
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                Reviews
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 mb-0.5">
              <span className="text-2xl font-bold text-foreground tabular-nums leading-none">
                {reviewCompleted}
              </span>
              <span className="text-sm text-muted-foreground/70 font-medium">
                / {reviewTotal}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mb-2.5">
              {reviewTotal > 0 ? `${reviewPct}% reviewed` : 'No reviews'}
            </p>
            <div className="h-1 rounded-full bg-muted/60 overflow-hidden">
              <div
                className="h-full rounded-full bg-violet-500 transition-all duration-700 ease-out"
                style={{ width: `${reviewPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Meetings */}
        <div className="relative overflow-hidden rounded-xl bg-card border border-border/40 p-4 hover:border-blue-500/30 transition-all duration-300 group/card">
          <CalendarClock className="absolute -top-1.5 -right-1.5 size-14 text-blue-500/[0.04] rotate-12 transition-all duration-500 group-hover/card:text-blue-500/[0.07] group-hover/card:rotate-6" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center justify-center size-7 rounded-lg bg-blue-500/10">
                <CalendarClock className="size-3.5 text-blue-500" />
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                Meetings
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 mb-0.5">
              <span className="text-2xl font-bold text-foreground tabular-nums leading-none">
                {activeMeetings.length}
              </span>
              {activeMeetings.length !== meetings.length && (
                <span className="text-[10px] text-muted-foreground/50 font-medium">
                  / {meetings.length}
                </span>
              )}
              {meetingMinutes > 0 && (
                <span className="text-[11px] text-muted-foreground/70 font-medium">
                  {formatMinutes(meetingMinutes)}
                </span>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground mb-2.5">
              {meetingMinutes > 0
                ? `${formatMinutes(meetingMinutes)} scheduled`
                : "No meetings"}
            </p>
            <div className="h-1 rounded-full bg-muted/60 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-700 ease-out"
                style={{ width: `${meetingPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Focus Time */}
        <div
          className="relative overflow-hidden rounded-xl bg-card border border-border/40 p-4 hover:border-green-500/30 transition-all duration-300 group/card"
          onClick={!hasWorkHours ? () => setWorkHoursOpen(true) : undefined}
          style={!hasWorkHours ? { cursor: 'pointer' } : undefined}
        >
          <Target className="absolute -top-1.5 -right-1.5 size-14 text-green-500/[0.04] rotate-12 transition-all duration-500 group-hover/card:text-green-500/[0.07] group-hover/card:rotate-6" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center justify-center size-7 rounded-lg bg-green-500/10">
                <Target className="size-3.5 text-green-500" />
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                Focus Time
              </span>
              <Tooltip
                interactive
                side="bottom"
                content={
                  <div style={{ maxWidth: 260, whiteSpace: 'normal', lineHeight: 1.5 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>What is Focus Time?</div>
                    <div style={{ marginBottom: 6 }}>
                      Time left for deep work after subtracting meetings from your workday.
                    </div>
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>Formula</div>
                    <div style={{ marginBottom: 6, fontFamily: 'monospace', fontSize: 10 }}>
                      Focus = Work Hours − Lunch − Meetings
                    </div>
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>Example</div>
                    <div style={{ fontSize: 10 }}>
                      Work: 9 AM – 5 PM (8h)<br />
                      Lunch: 12 – 1 PM (1h)<br />
                      Meetings: 1h 30m<br />
                      <span style={{ fontWeight: 600 }}>Focus Time = 5h 30m</span>
                    </div>
                  </div>
                }
              >
                <IconButton
                  variant="ghost"
                  size="xs"
                  className="ml-auto opacity-0 group-hover/card:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Info className="size-3 text-muted-foreground" />
                </IconButton>
              </Tooltip>
            </div>
            <div className="flex items-baseline gap-1.5 mb-0.5">
              <span className="text-2xl font-bold text-foreground leading-none">
                {hasWorkHours ? formatMinutes(focusMinutes) : '—'}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mb-2.5">
              {!hasWorkHours
                ? 'Set work hours to track'
                : focusMinutes > 0
                  ? 'Available for deep work'
                  : 'Fully booked'}
            </p>
            <div className="h-1 rounded-full bg-muted/60 overflow-hidden">
              <div
                className="h-full rounded-full bg-green-500 transition-all duration-700 ease-out"
                style={{ width: hasWorkHours ? `${focusPct}%` : '0%' }}
              />
            </div>
          </div>
        </div>

        {/* Work Hours */}
        <div
          className="relative overflow-hidden rounded-xl bg-card border border-border/40 p-4 hover:border-amber-500/30 transition-all duration-300 cursor-pointer group/card"
          onClick={() => setWorkHoursOpen(true)}
        >
          <Clock className="absolute -top-1.5 -right-1.5 size-14 text-amber-500/[0.04] rotate-12 transition-all duration-500 group-hover/card:text-amber-500/[0.07] group-hover/card:rotate-6" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center justify-center size-7 rounded-lg bg-amber-500/10">
                <Clock className="size-3.5 text-amber-500" />
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                Work Hours
              </span>
              <IconButton
                variant="ghost"
                size="xs"
                tooltip="Edit"
                className="ml-auto opacity-0 group-hover/card:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  setWorkHoursOpen(true);
                }}
              >
                <Pencil className="size-2.5 text-muted-foreground" />
              </IconButton>
            </div>
            <div className="flex items-baseline gap-1.5 mb-0.5">
              <span className="text-sm font-bold text-foreground truncate">
                {workHoursSummary}
              </span>
              {isUsingGlobalWork && (
                <span className="text-[9px] text-muted-foreground/60 font-medium shrink-0">
                  (default)
                </span>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground mb-2.5">
              {lunchSummary ??
                (hasWorkHours ? "No lunch break set" : "Click to set hours")}
            </p>
            <div className="h-1 rounded-full bg-muted/60 overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-700 ease-out"
                style={{ width: hasWorkHours ? "100%" : "0%" }}
              />
            </div>
          </div>
        </div>
      </div>

      <WorkHoursDialog open={workHoursOpen} onOpenChange={setWorkHoursOpen} />
    </>
  );
}
