import { cn } from '@/lib/utils'

import { formatDateShort } from '@/components/DailyPlan/utils/formatDate'
import { formatTimeRange } from '@/components/DailyPlan/utils/formatTime'
import { searchResultItemStyles as styles } from '../DailyPlanSearchPanel.styles'
import { getPriorityStyle } from '../utils/getPriorityStyle'

import type { SearchResultItemProps } from './SearchResultItem.types'

export function SearchResultItem(props: SearchResultItemProps): React.JSX.Element {
  const { item, onNavigate } = props

  const isTask = item.type === 'task'
  const title = item.data.title
  const date = formatDateShort(item.data.scheduledDate)
  const priority = item.data.priority
  const status = item.data.status

  const badgeClass = isTask ? styles.taskBadge : styles.meetingBadge
  const badgeLabel = isTask ? 'Task' : 'Meeting'

  const timeInfo = !isTask
    ? formatTimeRange(item.data.startTime, item.data.endTime)
    : null

  const handleClick = () => {
    onNavigate(item.data.scheduledDate)
  }

  return (
    <button type="button" className={styles.base} onClick={handleClick}>
      <div className={styles.titleRow}>
        <span className={styles.title}>{title}</span>
        <span className={cn(styles.badge, badgeClass)}>{badgeLabel}</span>
      </div>
      <div className={styles.metaRow}>
        <span className={styles.date}>{date}</span>
        {timeInfo && (
          <>
            <span className={styles.separator}>·</span>
            <span className={styles.date}>{timeInfo}</span>
          </>
        )}
        <span className={styles.separator}>·</span>
        <span className={cn(styles.priority, getPriorityStyle(priority))}>{priority}</span>
        <span className={styles.separator}>·</span>
        <span className={styles.status}>{status}</span>
      </div>
    </button>
  )
}
