import { CheckSquare, Clock, CalendarClock, MapPin, ExternalLink, Flag, Tag, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LinkifiedText, LinkRail } from '@/components/LinkifiedText'
import { TaskDescription } from '../TaskDescription'
import { useDailyPlanStore } from '@/store/daily-plan-store'
import type { DPTask, DPMeeting } from '../../DailyPlan.types'
import { PRIORITY_CONFIG } from '../../constants'
import { formatTime, formatTimeRange } from '../../utils/formatTime'

const PRIORITY_COLORS: Record<string, string> = {
  urgent: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#3b82f6',
}

/* ─── Task Hover Card ─── */

interface TaskHoverCardProps {
  task: DPTask
}

export function TaskHoverCard({ task }: TaskHoverCardProps): React.JSX.Element {
  const categories = useDailyPlanStore((s) => s.categories)
  const priorityConf = PRIORITY_CONFIG[task.priority]
  const category = task.categoryId ? categories.find((c) => c.id === task.categoryId) : null
  const priorityColor = PRIORITY_COLORS[task.priority] ?? '#3b82f6'

  return (
    <div className="w-64 rounded-xl border border-border/60 bg-popover text-popover-foreground shadow-xl p-3 space-y-2.5">
      {/* Header */}
      <div className="flex items-start gap-2">
        <div className="flex items-center justify-center size-7 rounded-lg bg-emerald-500/10 shrink-0 mt-0.5">
          <CheckSquare className="size-3.5 text-emerald-500" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-500/15 rounded px-1.5 py-0.5 leading-none">
            Task
          </span>
          <p className="text-sm font-semibold text-foreground mt-1 leading-snug">
            <LinkifiedText text={task.title} mode="inline" />
          </p>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <TaskDescription content={task.description} className="text-xs text-muted-foreground" />
      )}

      {/* Info rows */}
      <div className="space-y-1.5">
        {/* Priority */}
        <div className="flex items-center gap-2">
          <Flag className="size-3 text-muted-foreground shrink-0" />
          <span className="text-[11px] text-muted-foreground">Priority:</span>
          <span
            className={cn('text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-md', priorityConf.bgColor, priorityConf.color)}
          >
            {priorityConf.label}
          </span>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          <CheckSquare className="size-3 text-muted-foreground shrink-0" />
          <span className="text-[11px] text-muted-foreground">Status:</span>
          <span className={cn(
            'text-[10px] font-medium capitalize px-1.5 py-0.5 rounded-md',
            task.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' :
            task.status === 'in_progress' ? 'bg-blue-500/10 text-blue-500' :
            'bg-muted text-muted-foreground'
          )}>
            {task.status.replace('_', ' ')}
          </span>
        </div>

        {/* Scheduled time */}
        {task.scheduledTime && (
          <div className="flex items-center gap-2">
            <Clock className="size-3 text-muted-foreground shrink-0" />
            <span className="text-[11px] text-muted-foreground">Time:</span>
            <span className="text-[11px] text-foreground font-medium">
              {formatTime(task.scheduledTime)} · {task.durationMinutes} min
            </span>
          </div>
        )}

        {/* Category */}
        {category && (
          <div className="flex items-center gap-2">
            <Tag className="size-3 text-muted-foreground shrink-0" />
            <span className="text-[11px] text-muted-foreground">Category:</span>
            <span
              className="text-[10px] font-medium px-1.5 py-0.5 rounded-md"
              style={{ backgroundColor: `${category.color}15`, color: category.color }}
            >
              {category.name}
            </span>
          </div>
        )}
      </div>

      {/* Bottom border accent */}
      <div className="h-[2px] rounded-full" style={{ backgroundColor: priorityColor, opacity: 0.4 }} />
    </div>
  )
}

/* ─── Meeting Hover Card ─── */

interface MeetingHoverCardProps {
  meeting: DPMeeting
}

export function MeetingHoverCard({ meeting }: MeetingHoverCardProps): React.JSX.Element {
  const hasLocation = meeting.location && meeting.location.length > 0
  const hasLink = meeting.meetingLink && meeting.meetingLink.length > 0

  return (
    <div className="w-64 rounded-xl border border-border/60 bg-popover text-popover-foreground shadow-xl p-3 space-y-2.5">
      {/* Header */}
      <div className="flex items-start gap-2">
        <div className="flex items-center justify-center size-7 rounded-lg bg-blue-500/10 shrink-0 mt-0.5">
          <CalendarClock className="size-3.5 text-blue-500" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[9px] font-bold uppercase tracking-wider text-blue-500 bg-blue-500/15 rounded px-1.5 py-0.5 leading-none">
            Meeting
          </span>
          <p className="text-sm font-semibold text-foreground mt-1 leading-snug">
            <LinkifiedText text={meeting.title} mode="inline" />
          </p>
        </div>
      </div>

      {/* Description */}
      {meeting.description && (
        <p className="text-xs text-muted-foreground leading-relaxed">
          <LinkifiedText text={meeting.description} mode="inline" />
        </p>
      )}

      {meeting.description && <LinkRail text={meeting.description} />}

      {/* Info rows */}
      <div className="space-y-1.5">
        {/* Time range */}
        <div className="flex items-center gap-2">
          <Clock className="size-3 text-muted-foreground shrink-0" />
          <span className="text-[11px] text-muted-foreground">Time:</span>
          <span className="text-[11px] text-foreground font-medium">
            {formatTimeRange(meeting.startTime, meeting.endTime)}
          </span>
        </div>

        {/* Location */}
        {hasLocation && (
          <div className="flex items-center gap-2">
            <MapPin className="size-3 text-muted-foreground shrink-0" />
            <span className="text-[11px] text-muted-foreground">Location:</span>
            <span className="text-[11px] text-foreground font-medium">{meeting.location}</span>
          </div>
        )}

        {/* Meeting link */}
        {hasLink && (
          <div className="flex items-center gap-2">
            <ExternalLink className="size-3 text-muted-foreground shrink-0" />
            <span className="text-[11px] text-muted-foreground">Link:</span>
            <a
              href={meeting.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-primary hover:underline truncate font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              Join meeting
            </a>
          </div>
        )}

        {/* Date */}
        <div className="flex items-center gap-2">
          <Calendar className="size-3 text-muted-foreground shrink-0" />
          <span className="text-[11px] text-muted-foreground">Date:</span>
          <span className="text-[11px] text-foreground font-medium">{meeting.scheduledDate}</span>
        </div>
      </div>

      {/* Bottom border accent */}
      <div className="h-[2px] rounded-full bg-blue-500/40" />
    </div>
  )
}
