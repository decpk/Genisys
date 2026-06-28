import { useEffect, useState } from 'react'
import { CalendarClock, ExternalLink, MapPin } from 'lucide-react'
import { useIsAppActive } from '@/components/GenisysApp/active-app-registry'
import { cn } from '@/lib/utils'
import type { DPMeeting } from '../../DailyPlan.types'
import { formatTime } from '../../utils/formatTime'

interface UpcomingMeetingBannerProps {
  meetings: DPMeeting[]
  isToday: boolean
}

const LOOK_AHEAD_MINUTES = 15

function getMinutesSinceNow(time24: string): number {
  const now = new Date()
  const [h, m] = time24.split(':').map(Number)
  return (h * 60 + m) - (now.getHours() * 60 + now.getMinutes())
}

export function UpcomingMeetingBanner({ meetings, isToday }: UpcomingMeetingBannerProps): React.JSX.Element | null {
  const [, setTick] = useState(0)
  const isActive = useIsAppActive('dailyplan')

  // Re-render every 30s to keep "in X min" fresh — but only while DailyPlan is
  // the active app, so the timer goes quiet when the app is hidden/evicted. The
  // first fire is async (delay 0) so it refreshes on (re)activation without a
  // synchronous setState in the effect body.
  useEffect(() => {
    if (!isToday || !isActive) return
    let id = setTimeout(function tickNow() {
      setTick((t) => t + 1)
      id = setTimeout(tickNow, 30_000)
    }, 0)
    return () => clearTimeout(id)
  }, [isToday, isActive])

  if (!isToday) return null

  const upcoming = meetings
    .filter((m) => {
      if (m.status === 'cancelled' || m.status === 'completed') return false
      const minutesUntil = getMinutesSinceNow(m.startTime)
      return minutesUntil > 0 && minutesUntil <= LOOK_AHEAD_MINUTES
    })
    .sort((a, b) => getMinutesSinceNow(a.startTime) - getMinutesSinceNow(b.startTime))

  if (upcoming.length === 0) return null

  return (
    <div className="space-y-1.5">
      {upcoming.map((meeting) => {
        const minutesUntil = getMinutesSinceNow(meeting.startTime)
        const isImminent = minutesUntil <= 5

        return (
          <div
            key={meeting.id}
            className={cn(
              'flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors',
              isImminent
                ? 'border-orange-500/50 bg-orange-500/10 animate-pulse'
                : 'border-blue-500/40 bg-blue-500/[0.06]',
            )}
          >
            <div className={cn(
              'flex items-center justify-center size-7 rounded-md shrink-0',
              isImminent ? 'bg-orange-500/15' : 'bg-blue-500/15',
            )}>
              <CalendarClock className={cn(
                'size-3.5',
                isImminent ? 'text-orange-500' : 'text-blue-500',
              )} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-medium text-foreground truncate">{meeting.title}</p>
                <span className={cn(
                  'shrink-0 text-[10px] font-semibold rounded-full px-2 py-0.5',
                  isImminent
                    ? 'text-orange-600 dark:text-orange-400 bg-orange-500/15'
                    : 'text-blue-600 dark:text-blue-400 bg-blue-500/15',
                )}>
                  in {minutesUntil} min
                </span>
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-[10px] text-muted-foreground">
                  {formatTime(meeting.startTime)} – {formatTime(meeting.endTime)}
                </span>
                {meeting.location && (
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <MapPin className="size-2.5" />
                    {meeting.location}
                  </span>
                )}
                {meeting.meetingLink && (
                  <a
                    href={meeting.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[10px] text-blue-500 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="size-2.5" />
                    Join
                  </a>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
