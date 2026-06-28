import { useMemo } from 'react'

import { useIsAppActive } from '@/components/GenisysApp/active-app-registry'
import { useSecondTick } from '@/hooks/useSecondTick'
import { useSettingsStore } from '@/store/settings-store'

import { formatClockDate } from '../../utils/formatClockDate'
import { formatClockTime } from '../../utils/formatClockTime'
import { getTimeOfDayGreeting } from '../../utils/getTimeOfDayGreeting'
import type { UseTimeCalendarClockDataResult } from '../../TimeCalendarTile.types'

/**
 * Per-second data source for the Time & Calendar clock leaf. Ticks once per
 * second via the shared blur-aware ticker while the Dashboard app is active
 * (frozen on blur or when another app is visible), reads the persisted
 * 12/24-hour preference, and derives the clock parts, greeting, and date label.
 *
 * Isolated from the parent tile so that only this small leaf re-renders each
 * second — the tile chrome (actions, header, toggle, footer) and the month grid
 * do not.
 */
export function useTimeCalendarClockData(): UseTimeCalendarClockDataResult {
  const isActive = useIsAppActive('dashboard')
  // Shared 1 Hz ticker returns the current wall-clock ms while Dashboard is
  // active (paused on blur/hide); `new Date(ts)` is a pure derivation.
  const ts = useSecondTick(isActive)
  const now = useMemo(() => new Date(ts), [ts])

  const use24Hour = useSettingsStore((s) => s.dashboardClockUse24Hour)

  const greeting = useMemo(() => getTimeOfDayGreeting(now), [now])
  const clock = useMemo(() => formatClockTime(now, use24Hour), [now, use24Hour])
  const dateLabel = useMemo(() => formatClockDate(now), [now])

  return { clock, greeting, dateLabel }
}
