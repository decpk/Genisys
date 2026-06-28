import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { TimePicker } from '@/components/ui/time-picker'
import { useSettingsStore } from '@/store/settings-store'
import { X } from 'lucide-react'

import type { DPWorkHoursFormData } from '../../DailyPlan.types'
import { formatTime } from '../../utils/formatTime'
import { useWorkHoursDialogData } from './useWorkHoursDialogData'
import { formatTimeToString } from './utils/formatTimeToString'
import { parseTimeString } from './utils/parseTimeString'
import type { WorkHoursDialogProps } from './WorkHoursDialog.types'

export function WorkHoursDialog(props: WorkHoursDialogProps) {
  const { open, onOpenChange } = props

  const { formData, handleFieldChange, handleSubmit, handleClear, handleClearWorkHours, handleClearLunchHours } =
    useWorkHoursDialogData(open, onOpenChange)

  const dpWorkStartTime = useSettingsStore((s) => s.dpWorkStartTime)
  const dpWorkEndTime = useSettingsStore((s) => s.dpWorkEndTime)
  const dpLunchStartTime = useSettingsStore((s) => s.dpLunchStartTime)
  const dpLunchEndTime = useSettingsStore((s) => s.dpLunchEndTime)

  const hasWorkHours = formData.workStartTime !== null || formData.workEndTime !== null
  const hasLunchHours = formData.lunchStartTime !== null || formData.lunchEndTime !== null
  const hasAnyValue = hasWorkHours || hasLunchHours

  const hasGlobalWork = dpWorkStartTime !== null || dpWorkEndTime !== null
  const hasGlobalLunch = dpLunchStartTime !== null || dpLunchEndTime !== null

  function onTimeChange(field: keyof DPWorkHoursFormData, date: Date) {
    handleFieldChange(field, formatTimeToString(date))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Work Hours</DialogTitle>
            <DialogDescription>
              Set hours for today, or leave empty to use defaults from Settings.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b pb-1">
                <p className="text-sm font-medium">Work Hours</p>
                {hasWorkHours && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive h-6 px-1.5 gap-1 text-xs"
                    onClick={handleClearWorkHours}
                  >
                    <X className="size-3" />
                    Clear
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">
                    Start Time
                  </label>
                  <TimePicker
                    value={parseTimeString(formData.workStartTime)}
                    onChange={(date) => onTimeChange('workStartTime', date)}
                  />
                  {!formData.workStartTime && dpWorkStartTime && (
                    <p className="text-[10px] text-muted-foreground/60">Default: {formatTime(dpWorkStartTime)}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">
                    End Time
                  </label>
                  <TimePicker
                    value={parseTimeString(formData.workEndTime)}
                    onChange={(date) => onTimeChange('workEndTime', date)}
                  />
                  {!formData.workEndTime && dpWorkEndTime && (
                    <p className="text-[10px] text-muted-foreground/60">Default: {formatTime(dpWorkEndTime)}</p>
                  )}
                </div>
              </div>
              {!hasWorkHours && hasGlobalWork && (
                <p className="text-[10px] text-muted-foreground/60">
                  Using global defaults from Settings
                </p>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between border-b pb-1">
                <p className="text-sm font-medium">Lunch Break</p>
                {hasLunchHours && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive h-6 px-1.5 gap-1 text-xs"
                    onClick={handleClearLunchHours}
                  >
                    <X className="size-3" />
                    Clear
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">
                    Start Time
                  </label>
                  <TimePicker
                    value={parseTimeString(formData.lunchStartTime)}
                    onChange={(date) => onTimeChange('lunchStartTime', date)}
                  />
                  {!formData.lunchStartTime && dpLunchStartTime && (
                    <p className="text-[10px] text-muted-foreground/60">Default: {formatTime(dpLunchStartTime)}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">
                    End Time
                  </label>
                  <TimePicker
                    value={parseTimeString(formData.lunchEndTime)}
                    onChange={(date) => onTimeChange('lunchEndTime', date)}
                  />
                  {!formData.lunchEndTime && dpLunchEndTime && (
                    <p className="text-[10px] text-muted-foreground/60">Default: {formatTime(dpLunchEndTime)}</p>
                  )}
                </div>
              </div>
              {!hasLunchHours && hasGlobalLunch && (
                <p className="text-[10px] text-muted-foreground/60">
                  Using global defaults from Settings
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="flex-row justify-between sm:justify-between">
            <div>
              {hasAnyValue && (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={handleClear}
                >
                  Clear All
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Submit</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
