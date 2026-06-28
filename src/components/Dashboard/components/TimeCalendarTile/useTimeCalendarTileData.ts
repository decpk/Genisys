import { useCallback, useMemo } from 'react'

import { useIsAppActive } from '@/components/GenisysApp/active-app-registry'
import { useDayTick } from '@/hooks/useSecondTick'
import { useSettingsStore } from '@/store/settings-store'

import { WEEKDAY_HEADERS } from './TimeCalendarTile.constants'
import { buildMonthGrid } from './utils/buildMonthGrid'
import { getDayOfYear } from './utils/getDayOfYear'
import { getMonthLabel } from './utils/getMonthLabel'
import { getWeekNumber } from './utils/getWeekNumber'
import type { UseTimeCalendarTileDataResult } from './TimeCalendarTile.types'

/**
 * Orchestrator for the Time & Calendar tile chrome + calendar. Ticks at most
 * once per DAY via the shared blur-aware ticker (`useDayTick`) while the
 * Dashboard app is active, reads the persisted 12/24-hour preference from
 * `useSettingsStore`, and derives the day-scoped month grid / stats.
 *
 * The per-second clock lives in the isolated `TimeCalendarClock` leaf, so the
 * tile shell, action buttons, format toggle, and month grid do NOT re-render
 * every second — only at the day rollover (or on user interaction).
 */
export function useTimeCalendarTileData(): UseTimeCalendarTileDataResult {
  const isActive = useIsAppActive('dashboard')
  // Shared ticker collapsed to a per-day snapshot: the returned timestamp is the
  // current local midnight, so this hook only re-renders when the day changes.
  const dayTs = useDayTick(isActive)

  const use24Hour = useSettingsStore((s) => s.dashboardClockUse24Hour)
  const setUse24Hour = useSettingsStore((s) => s.setDashboardClockUse24Hour)

  const dayScoped = useMemo(() => {
    const dayDate = new Date(dayTs)
    return {
      year: dayDate.getFullYear(),
      monthLabel: getMonthLabel(dayDate),
      monthCells: buildMonthGrid(dayDate),
      weekNumber: getWeekNumber(dayDate),
      dayOfYear: getDayOfYear(dayDate),
    }
  }, [dayTs])

  const toggleClockFormat = useCallback(() => {
    setUse24Hour(!use24Hour)
  }, [use24Hour, setUse24Hour])

  return {
    monthLabel: dayScoped.monthLabel,
    monthCells: dayScoped.monthCells,
    weekdayHeaders: WEEKDAY_HEADERS,
    weekNumber: dayScoped.weekNumber,
    dayOfYear: dayScoped.dayOfYear,
    year: dayScoped.year,
    use24Hour,
    toggleClockFormat,
  }
}
