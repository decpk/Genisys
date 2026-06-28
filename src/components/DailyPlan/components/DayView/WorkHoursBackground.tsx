import { useDailyPlanStore } from '@/store/daily-plan-store'
import { useSettingsStore } from '@/store/settings-store'
import { getEffectiveWorkHours } from '../../utils/getEffectiveWorkHours'
import { getWorkHoursLayout } from '../../utils/getWorkHoursStyle'

interface WorkHoursBackgroundProps {
  hourHeight: number
  startHour: number
  gutterPx: number
}

export function WorkHoursBackground(props: WorkHoursBackgroundProps): React.JSX.Element | null {
  const { hourHeight, startHour, gutterPx } = props

  const selectedDate = useDailyPlanStore((s) => s.selectedDate)
  const dailyEntries = useDailyPlanStore((s) => s.dailyEntries)
  const entry = dailyEntries[selectedDate]

  const dpWorkStartTime = useSettingsStore((s) => s.dpWorkStartTime)
  const dpWorkEndTime = useSettingsStore((s) => s.dpWorkEndTime)
  const dpLunchStartTime = useSettingsStore((s) => s.dpLunchStartTime)
  const dpLunchEndTime = useSettingsStore((s) => s.dpLunchEndTime)

  const effectiveHours = getEffectiveWorkHours(entry, {
    workStartTime: dpWorkStartTime,
    workEndTime: dpWorkEndTime,
    lunchStartTime: dpLunchStartTime,
    lunchEndTime: dpLunchEndTime,
  })

  const { workSegments, lunchRegion } = getWorkHoursLayout(effectiveHours, hourHeight, startHour)

  if (workSegments.length === 0) return null

  return (
    <>
      {/* Work hours background segments (split around lunch) */}
      {workSegments.map((seg, i) => (
        <div key={i}>
          <div
            className="absolute rounded-sm pointer-events-none"
            style={{
              top: seg.topPx,
              height: seg.heightPx,
              left: gutterPx,
              right: 0,
              background: 'var(--color-amber-500)',
              opacity: 0.04,
              zIndex: 1,
            }}
          />
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              top: seg.topPx,
              height: seg.heightPx,
              left: gutterPx,
              width: 2,
              background: 'var(--color-amber-500)',
              opacity: 0.2,
              zIndex: 2,
            }}
          />
        </div>
      ))}

      {/* Lunch break — dashed border with tinted bg */}
      {lunchRegion && (
        <div
          className="absolute pointer-events-none rounded-sm border border-dashed flex items-center justify-center"
          style={{
            top: lunchRegion.topPx,
            height: lunchRegion.heightPx,
            left: gutterPx,
            right: 0,
            borderColor: 'color-mix(in srgb, var(--color-green-500) 20%, transparent)',
            background: 'color-mix(in srgb, var(--color-green-500) 3%, transparent)',
            zIndex: 2,
          }}
        >
          <span
            className="text-[10px] font-medium tracking-wider uppercase select-none"
            style={{ color: 'color-mix(in srgb, var(--color-green-500) 35%, transparent)' }}
          >
            Lunch Break
          </span>
        </div>
      )}
    </>
  )
}
