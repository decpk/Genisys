import { memo } from 'react'
import { X, ArrowRight } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { TimePicker } from '@/components/ui/time-picker'
import { Dropdown } from '@/components/ui/dropdown'
import { useThemeCatalogStore } from '@/store/theme-catalog-store'
import { findThemeById } from '@/themes/utils/findThemeById'
import { parseTimeString } from '@/components/DailyPlan/components/WorkHoursDialog/utils/parseTimeString'
import { formatTimeToString } from '@/components/DailyPlan/components/WorkHoursDialog/utils/formatTimeToString'
import { buildThemeDropdownGroups } from '@/themes/utils/buildThemeDropdownGroups'
import type { ThemeScheduleRangeRowProps } from '../../AutoThemeScheduleSetting.types'

const DEFAULT_START = '09:00'
const DEFAULT_END = '17:00'

export const ThemeScheduleRangeRow = memo(function ThemeScheduleRangeRow(props: ThemeScheduleRangeRowProps) {
  const { range, index, errors, onUpdate, onRemove } = props
  const customThemes = useThemeCatalogStore(useShallow((s) => s.customThemes))

  const selectedTheme = findThemeById(range.themeId)
  const themeLabel = selectedTheme ? selectedTheme.name : 'Select theme'
  const themeGroups = buildThemeDropdownGroups(range.themeId, handleThemeSelect, customThemes)
  const hasErrors = errors.length > 0

  function handleStartTimeChange(date: Date): void {
    onUpdate(range.id, 'startTime', formatTimeToString(date))
  }

  function handleEndTimeChange(date: Date): void {
    onUpdate(range.id, 'endTime', formatTimeToString(date))
  }

  function handleThemeSelect(themeId: string): void {
    onUpdate(range.id, 'themeId', themeId)
  }

  function handleRemove(): void {
    onRemove(range.id)
  }

  return (
    <div className="space-y-1">
      <div className={cn(
        'group flex items-center gap-2.5 rounded-lg px-3 py-2 bg-secondary/30 hover:bg-secondary/50 transition-colors',
        hasErrors && 'ring-1 ring-destructive/30'
      )}>
        <span className="text-[10px] font-medium text-muted-foreground/70 w-4 shrink-0">{index + 1}</span>
        <TimePicker
          value={parseTimeString(range.startTime) ?? parseTimeString(DEFAULT_START)}
          onChange={handleStartTimeChange}
          variant="compact"
        />
        <ArrowRight className="size-3 text-muted-foreground/50 shrink-0" />
        <TimePicker
          value={parseTimeString(range.endTime) ?? parseTimeString(DEFAULT_END)}
          onChange={handleEndTimeChange}
          variant="compact"
        />
        <Dropdown
          groups={themeGroups}
          openOn="click"
          maxHeight="50vh"
          menuWidth="224px"
          trigger={
            <Button type="button" variant="ghost" size="sm" className="gap-1.5 h-7 px-2 justify-start text-xs text-muted-foreground hover:text-foreground ml-auto">
              <span
                className="size-2.5 rounded-full shrink-0"
                style={{ backgroundColor: selectedTheme?.colors.primary ?? 'hsl(240 5% 35%)' }}
              />
              <span className="truncate max-w-[120px]">{themeLabel}</span>
            </Button>
          }
          side="bottom"
          align="right"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
          onClick={handleRemove}
        >
          <X className="size-3" />
        </Button>
      </div>
      {hasErrors && (
        <div className="pl-6.5">
          {errors.map((err) => (
            <p key={err} className="text-[11px] text-destructive leading-tight">{err}</p>
          ))}
        </div>
      )}
    </div>
  )
})
