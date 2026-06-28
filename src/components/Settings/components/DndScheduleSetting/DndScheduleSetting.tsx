import { memo } from 'react'
import { Plus, BellOff } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'

import { useDndScheduleSettingData } from './useDndScheduleSettingData'
import { DndRangeRow } from './components/DndRangeRow'
import { STYLES } from './DndScheduleSetting.styles'

export const DndScheduleSetting = memo(function DndScheduleSetting() {
  const {
    enabled,
    ranges,
    canAddRange,
    status,
    handleToggleEnabled,
    handleAddRange,
    handleUpdateRange,
    handleRemoveRange,
  } = useDndScheduleSettingData()

  const statusClassName =
    status.variant === 'active' ? STYLES.statusActive : STYLES.statusInactive

  const statusBadge = (
    <span className={cn(STYLES.statusBadge, statusClassName)}>
      <BellOff className="size-3" />
      {status.label}
    </span>
  )

  const rangeRows = ranges.map((range, index) => (
    <DndRangeRow
      key={range.id}
      range={range}
      index={index}
      onUpdate={handleUpdateRange}
      onRemove={handleRemoveRange}
    />
  ))

  const addButtonLabel = canAddRange ? 'Add Quiet Hours' : 'Max ranges reached'

  let emptyHint: React.ReactNode = null
  if (enabled && ranges.length === 0) {
    emptyHint = (
      <p className={STYLES.emptyHint}>
        Add a quiet-hours range to start silencing notifications.
      </p>
    )
  }

  let body: React.ReactNode = null
  if (enabled) {
    body = (
      <div className={cn(STYLES.container, 'mt-4')}>
        {emptyHint}
        <div className={STYLES.rangeList}>{rangeRows}</div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={STYLES.addButton}
          disabled={!canAddRange}
          onClick={handleAddRange}
        >
          <Plus className="size-3.5" />
          {addButtonLabel}
        </Button>
      </div>
    )
  }

  return (
    <div className="py-5">
      <div className={STYLES.headerRow}>
        <div>
          <p className="text-sm font-medium text-foreground">Do Not Disturb</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Silence in-app toasts and OS notifications during quiet hours.
            Errors always break through.
          </p>
        </div>
        <Switch checked={enabled} onCheckedChange={handleToggleEnabled} />
      </div>

      <div className="mt-2">{statusBadge}</div>

      {body}
    </div>
  )
})
