import { memo } from 'react'
import {
  Globe, Code, Palette, Mail, Braces, Terminal,
  FolderOpen, Phone, ClipboardList, ImageIcon,
} from 'lucide-react'
import { TimelineItemCard } from '../../../TimelineItemCard'
import { TimelineCategoryBar } from '../TimelineCategoryBar'
import { TimelineSecurityAlert } from '../TimelineSecurityAlert'
import type { TimelineSessionGroupProps } from './TimelineSessionGroup.types'
import {
  SESSION_GROUP_ROOT, SESSION_HEADER, SESSION_ICON, SESSION_LABEL,
  SESSION_TIME_RANGE, SESSION_ITEM_COUNT, SESSION_DURATION,
  SESSION_ITEMS, SESSION_VERTICAL_LINE, SESSION_META_ROW,
} from './TimelineSessionGroup.styles'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Globe, Code, Palette, Mail, Braces, Terminal,
  FolderOpen, Phone, ClipboardList, ImageIcon,
}

function formatSessionTime(iso: string): string {
  const d = new Date(iso)
  const hours = d.getHours()
  const minutes = d.getMinutes()
  const period = hours >= 12 ? 'PM' : 'AM'
  const h12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
  const mm = String(minutes).padStart(2, '0')
  return `${h12}:${mm} ${period}`
}

function computeDuration(start: string, end: string): string {
  const ms = new Date(end).getTime() - new Date(start).getTime()
  const totalMinutes = Math.max(1, Math.round(ms / 60000))
  if (totalMinutes < 60) return `${totalMinutes}m`
  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

export const TimelineSessionGroup = memo(function TimelineSessionGroup(props: TimelineSessionGroupProps): React.JSX.Element {
  const { session, categoryBreakdown, securityAlerts } = props

  const IconComponent = ICON_MAP[session.icon] ?? ClipboardList
  const timeRange = `${formatSessionTime(session.startTime)} – ${formatSessionTime(session.endTime)}`
  const duration = computeDuration(session.startTime, session.endTime)
  const itemCount = `${session.items.length} item${session.items.length !== 1 ? 's' : ''}`

  const alertItemIds = new Set(securityAlerts.map((a) => a.itemId))

  const hasCategoryBar = categoryBreakdown && categoryBreakdown.categories.length > 0

  const categoryBar = hasCategoryBar ? (
    <div className="px-3 pb-1">
      <TimelineCategoryBar breakdown={categoryBreakdown} />
    </div>
  ) : null

  return (
    <div className={SESSION_GROUP_ROOT}>
      <div className={SESSION_HEADER}>
        <IconComponent className={SESSION_ICON} />
        <div className={SESSION_META_ROW}>
          <span className={SESSION_LABEL}>{session.label}</span>
          <span className={SESSION_DURATION}>{duration}</span>
        </div>
        <span className={SESSION_TIME_RANGE}>{timeRange}</span>
        <span className={SESSION_ITEM_COUNT}>{itemCount}</span>
      </div>
      {categoryBar}
      <div className={SESSION_ITEMS}>
        <div className={SESSION_VERTICAL_LINE} />
        {session.items.map((item) => {
          const alert = alertItemIds.has(item.id)
            ? securityAlerts.find((a) => a.itemId === item.id)
            : undefined
          const alertElement = alert ? (
            <TimelineSecurityAlert key={`alert-${item.id}`} alert={alert} />
          ) : null
          return (
            <div key={item.id}>
              {alertElement}
              <TimelineItemCard item={item} />
            </div>
          )
        })}
      </div>
    </div>
  )
})
