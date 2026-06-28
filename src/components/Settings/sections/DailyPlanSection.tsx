import { memo } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TimePicker } from '@/components/ui/time-picker'
import { useSettingsStore } from '@/store/settings-store'
import { parseTimeString } from '@/components/DailyPlan/components/WorkHoursDialog/utils/parseTimeString'
import { formatTimeToString } from '@/components/DailyPlan/components/WorkHoursDialog/utils/formatTimeToString'
import { formatTime } from '@/components/DailyPlan/utils/formatTime'

const DISPLAY_WORK_START = '09:00'
const DISPLAY_WORK_END = '17:00'
const DISPLAY_LUNCH_START = '13:00'
const DISPLAY_LUNCH_END = '14:00'

export const DailyPlanSection = memo(function DailyPlanSection() {
  const dpWorkStartTime = useSettingsStore((s) => s.dpWorkStartTime)
  const dpWorkEndTime = useSettingsStore((s) => s.dpWorkEndTime)
  const dpLunchStartTime = useSettingsStore((s) => s.dpLunchStartTime)
  const dpLunchEndTime = useSettingsStore((s) => s.dpLunchEndTime)
  const setDpWorkHours = useSettingsStore((s) => s.setDpWorkHours)
  const clearDpWorkHours = useSettingsStore((s) => s.clearDpWorkHours)
  const clearDpLunchHours = useSettingsStore((s) => s.clearDpLunchHours)

  const hasWorkHours = dpWorkStartTime !== null || dpWorkEndTime !== null
  const hasLunchHours = dpLunchStartTime !== null || dpLunchEndTime !== null

  function handleTimeChange(field: 'workStartTime' | 'workEndTime' | 'lunchStartTime' | 'lunchEndTime', date: Date) {
    const timeStr = formatTimeToString(date)
    setDpWorkHours({
      workStartTime: field === 'workStartTime' ? timeStr : dpWorkStartTime,
      workEndTime: field === 'workEndTime' ? timeStr : dpWorkEndTime,
      lunchStartTime: field === 'lunchStartTime' ? timeStr : dpLunchStartTime,
      lunchEndTime: field === 'lunchEndTime' ? timeStr : dpLunchEndTime,
    })
  }

  const workSummary = hasWorkHours
    ? `${dpWorkStartTime ? formatTime(dpWorkStartTime) : '—'} – ${dpWorkEndTime ? formatTime(dpWorkEndTime) : '—'}`
    : null

  const lunchSummary = hasLunchHours
    ? `${dpLunchStartTime ? formatTime(dpLunchStartTime) : '—'} – ${dpLunchEndTime ? formatTime(dpLunchEndTime) : '—'}`
    : null

  return (
    <>
      {/* Work Hours */}
      <div className="py-5">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-sm font-medium text-foreground">Default Work Hours</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Applied to all days unless overridden per day.
              {workSummary && (
                <span className="text-foreground/60 ml-1.5">Currently: {workSummary}</span>
              )}
            </p>
          </div>
          {hasWorkHours && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive h-7 px-2 gap-1"
              onClick={clearDpWorkHours}
            >
              <X className="size-3" />
              Clear
            </Button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4 mt-3 max-w-xs">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Start Time</label>
            <TimePicker
              value={parseTimeString(dpWorkStartTime) ?? parseTimeString(DISPLAY_WORK_START)}
              onChange={(date) => handleTimeChange('workStartTime', date)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">End Time</label>
            <TimePicker
              value={parseTimeString(dpWorkEndTime) ?? parseTimeString(DISPLAY_WORK_END)}
              onChange={(date) => handleTimeChange('workEndTime', date)}
            />
          </div>
        </div>
      </div>

      {/* Lunch Break */}
      <div className="py-5">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-sm font-medium text-foreground">Default Lunch Break</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Applied to all days unless overridden per day.
              {lunchSummary && (
                <span className="text-foreground/60 ml-1.5">Currently: {lunchSummary}</span>
              )}
            </p>
          </div>
          {hasLunchHours && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive h-7 px-2 gap-1"
              onClick={clearDpLunchHours}
            >
              <X className="size-3" />
              Clear
            </Button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4 mt-3 max-w-xs">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Start Time</label>
            <TimePicker
              value={parseTimeString(dpLunchStartTime) ?? parseTimeString(DISPLAY_LUNCH_START)}
              onChange={(date) => handleTimeChange('lunchStartTime', date)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">End Time</label>
            <TimePicker
              value={parseTimeString(dpLunchEndTime) ?? parseTimeString(DISPLAY_LUNCH_END)}
              onChange={(date) => handleTimeChange('lunchEndTime', date)}
            />
          </div>
        </div>
      </div>
    </>
  )
})
