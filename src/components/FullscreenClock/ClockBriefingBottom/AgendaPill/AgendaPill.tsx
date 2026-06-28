import { formatTime } from '@/components/DailyPlan/utils/formatTime'

import { PILL_CONTAINER, PILL_TIME, PILL_TITLE } from './AgendaPill.styles'
import type { AgendaPillProps } from './AgendaPill.types'

export function AgendaPill(props: AgendaPillProps): React.JSX.Element {
  const { pill } = props
  const displayTime = formatTime(pill.time24)

  return (
    <div className={PILL_CONTAINER}>
      <span className={PILL_TIME}>{displayTime}</span>
      <span className={PILL_TITLE}>{pill.title}</span>
    </div>
  )
}
