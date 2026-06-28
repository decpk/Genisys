import { memo } from 'react'
import { Plus, Clock } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { useAutoThemeScheduleSettingData } from './useAutoThemeScheduleSettingData'
import { ThemeScheduleRangeRow } from './components/ThemeScheduleRangeRow'
import { ScheduleTimelineBar } from './components/ScheduleTimelineBar'
import { STYLES } from './AutoThemeScheduleSetting.styles'

export const AutoThemeScheduleSetting = memo(function AutoThemeScheduleSetting() {
  const {
    enabled,
    pauseOnManualChange,
    ranges,
    canAddRange,
    status,
    validationErrors,
    errorsForRange,
    handleToggleEnabled,
    handleTogglePauseOnManual,
    handleAddRange,
    handleUpdateRange,
    handleRemoveRange,
  } = useAutoThemeScheduleSettingData()

  const statusClassName = status.variant === 'active'
    ? STYLES.statusActive
    : status.variant === 'paused'
      ? STYLES.statusPaused
      : ''

  const statusBadge = status.label
    ? (
      <span className={cn(STYLES.statusBadge, statusClassName)}>
        <Clock className="size-3" />
        {status.label}
      </span>
    )
    : null

  const rangeRows = ranges.map((range, index) => (
    <ThemeScheduleRangeRow
      key={range.id}
      range={range}
      index={index}
      errors={errorsForRange(range.id, index)}
      onUpdate={handleUpdateRange}
      onRemove={handleRemoveRange}
    />
  ))

  const addButtonDisabled = !canAddRange
  const addButtonLabel = canAddRange ? 'Add Range' : 'Max ranges reached'

  return (
    <div className="py-5">
      <div className={STYLES.headerRow}>
        <div>
          <p className="text-sm font-medium text-foreground">Automatic Theme Schedule</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Automatically switch themes based on time of day.
          </p>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={handleToggleEnabled}
        />
      </div>

      {statusBadge && <div className="mt-2">{statusBadge}</div>}

      {enabled && (
        <div className={cn(STYLES.container, 'mt-4')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-foreground">Pause on manual change</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Disable auto theme when you manually switch themes.
              </p>
            </div>
            <Switch
              checked={pauseOnManualChange}
              onCheckedChange={handleTogglePauseOnManual}
            />
          </div>

          {ranges.length > 0 && <ScheduleTimelineBar ranges={ranges} />}

          <div className={STYLES.rangeList}>
            {rangeRows}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className={STYLES.addButton}
            disabled={addButtonDisabled}
            onClick={handleAddRange}
          >
            <Plus className="size-3.5" />
            {addButtonLabel}
          </Button>
        </div>
      )}
    </div>
  )
})
