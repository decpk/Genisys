import {
  CalendarClock,
  Clock,
  ClipboardList,
  FileText,
  ListTodo,
  MapPin,
  Video,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { LinkifiedText, LinkRail } from '@/components/LinkifiedText'
import { MeetingContextMenu, MeetingDropdownMenu } from '../../MeetingContextMenu'
import { PriorityDot } from '../../shared/priority'
import { useMeetingCardData } from './useMeetingCardData'
import { meetingCardStyles as s } from './MeetingCard.styles'
import type { MeetingCardProps } from './MeetingCard.types'

export function MeetingCard(props: MeetingCardProps): React.JSX.Element {
  const { meeting, onEdit } = props
  const data = useMeetingCardData({ meeting, onEdit })
  const { flags } = data

  const statusChipClass = cn(s.statusChip, data.statusPillClass)

  function handleJoinClick(e: React.MouseEvent) {
    e.stopPropagation()
  }

  const card = (
    <div
      onDoubleClick={data.handleDoubleClick}
      className={data.cardClass}
    >
      <div className={s.inner}>
        <MeetingDropdownMenu meeting={meeting} onEdit={onEdit} className={s.menuButton} />

        <div className={s.row1}>
          <div className={s.iconContainer}>
            <CalendarClock className={s.icon} />
          </div>

          <div className={s.titleContainer}>
            <p className={data.titleClass}>
              <LinkifiedText text={meeting.title} mode="inline" singleLine />
            </p>
            {flags.hasNotes && <FileText className={s.indicatorIcon} />}
            {flags.hasFollowUp && <ListTodo className={s.indicatorIcon} />}
            {flags.hasAgenda && <ClipboardList className={s.indicatorIcon} />}
          </div>

          {data.showPriorityDot && <PriorityDot visual={data.priorityVisual} />}

          <div className={s.timePill}>
            <Clock className={s.timePillIcon} />
            <span className={s.timePillText}>{data.timeRangeText}</span>
            {data.duration && (
              <span className={s.timePillDuration}>({data.duration})</span>
            )}
          </div>
        </div>

        <div className={s.chipRow}>
          <span className={statusChipClass}>{data.statusLabel}</span>

          {flags.showTypeBadge && (
            <span className={s.typeChip}>{data.typeLabel}</span>
          )}

          {flags.hasLink && (
            <a
              href={meeting.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className={s.joinChip}
              onClick={handleJoinClick}
            >
              <Video className={s.joinChipIcon} />
              Join
            </a>
          )}

          {flags.hasLocation && (
            <span className={s.locationChip}>
              <MapPin className={s.locationChipIcon} />
              {meeting.location}
            </span>
          )}
        </div>

        {flags.hasDescription && (
          <p className={s.description}>
            <LinkifiedText text={meeting.description} mode="inline" />
          </p>
        )}

        {flags.hasDescription && (
          <LinkRail text={meeting.description} className={s.linkRail} />
        )}
      </div>
    </div>
  )

  return (
    <MeetingContextMenu meeting={meeting} onEdit={onEdit}>
      {card}
    </MeetingContextMenu>
  )
}
