import { memo } from 'react'
import { X, ArrowRight } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { TimePicker } from '@/components/ui/time-picker'
import { parseTimeString } from '@/components/DailyPlan/components/WorkHoursDialog/utils/parseTimeString'
import { formatTimeToString } from '@/components/DailyPlan/components/WorkHoursDialog/utils/formatTimeToString'

import { isOvernightRange } from '../../utils/isOvernightRange'
import type { DndRangeRowProps } from './DndRangeRow.types'
import { STYLES } from './DndRangeRow.styles'

const DEFAULT_START = '22:00'
const DEFAULT_END = '08:00'

export const DndRangeRow = memo(function DndRangeRow(props: DndRangeRowProps) {
  const { range, index, onUpdate, onRemove } = props

  const overnight = isOvernightRange(range.startTime, range.endTime)

  function handleStartTimeChange(date: Date): void {
    onUpdate(range.id, 'startTime', formatTimeToString(date))
  }

  function handleEndTimeChange(date: Date): void {
    onUpdate(range.id, 'endTime', formatTimeToString(date))
  }

  function handleRemove(): void {
    onRemove(range.id)
  }

  let overnightBadge: React.ReactNode = null
  if (overnight) {
    overnightBadge = <span className={STYLES.overnightBadge}>Overnight</span>
  }

  return (
    <div className={cn(STYLES.row)}>
      <span className={STYLES.index}>{index + 1}</span>
      <TimePicker
        value={parseTimeString(range.startTime) ?? parseTimeString(DEFAULT_START)}
        onChange={handleStartTimeChange}
        variant="compact"
      />
      <ArrowRight className={STYLES.arrow} />
      <TimePicker
        value={parseTimeString(range.endTime) ?? parseTimeString(DEFAULT_END)}
        onChange={handleEndTimeChange}
        variant="compact"
      />
      {overnightBadge}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={STYLES.removeButton}
        onClick={handleRemove}
      >
        <X className="size-3" />
      </Button>
    </div>
  )
})
