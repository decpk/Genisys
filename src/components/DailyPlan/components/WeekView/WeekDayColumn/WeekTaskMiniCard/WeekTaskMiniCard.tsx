import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { useWeekTaskMiniCardData } from './useWeekTaskMiniCardData'
import { getTaskPriorityDotColor } from '../../utils/getTaskPriorityDotColor'
import { weekTaskMiniCardStyles as s } from './WeekTaskMiniCard.styles'
import type { WeekTaskMiniCardProps } from './WeekTaskMiniCard.types'

export function WeekTaskMiniCard(props: WeekTaskMiniCardProps): React.JSX.Element {
  const { task } = props
  const { isCompleted, handleToggle } = useWeekTaskMiniCardData(props)
  const dotColor = getTaskPriorityDotColor(task.priority)
  const titleClass = cn(s.title, isCompleted && s.titleCompleted)

  return (
    <div className={s.container}>
      <Checkbox
        checked={isCompleted}
        onCheckedChange={handleToggle}
        className={s.checkbox}
      />
      <span className={titleClass}>{task.title}</span>
      <span className={s.priorityDot} style={{ backgroundColor: dotColor }} />
    </div>
  )
}
