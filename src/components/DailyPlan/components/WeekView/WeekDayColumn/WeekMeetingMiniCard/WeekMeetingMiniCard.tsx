import { CalendarClock } from 'lucide-react'
import { formatTime } from '../../../../utils/formatTime'
import { weekMeetingMiniCardStyles as s } from './WeekMeetingMiniCard.styles'
import type { WeekMeetingMiniCardProps } from './WeekMeetingMiniCard.types'

export function WeekMeetingMiniCard(props: WeekMeetingMiniCardProps): React.JSX.Element {
  const { meeting } = props

  return (
    <div className={s.container}>
      <CalendarClock className={s.icon} />
      <div className={s.textColumn}>
        <p className={s.time}>{formatTime(meeting.startTime)}</p>
        <p className={s.title}>{meeting.title}</p>
      </div>
    </div>
  )
}
