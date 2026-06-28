import type { TileWidth } from '@/store/dashboard-store'

import type { DragHandleProps } from '../SortableTile/SortableTile.types'

export interface TimeCalendarTileProps {
  tileWidth: TileWidth
  onWidthChange: (width: TileWidth) => void
  dragHandleProps: DragHandleProps
}

/** A single rendered cell in the 6×7 month grid. */
export interface MonthGridCell {
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  isWeekend: boolean
  key: string
}

/** Display parts for the digital clock, produced by `formatClockTime`. */
export interface ClockParts {
  hours: string
  minutes: string
  seconds: string
  period: string
}

/** Return shape of the `useTimeCalendarClockData` leaf hook (per-second). */
export interface UseTimeCalendarClockDataResult {
  clock: ClockParts
  greeting: string
  dateLabel: string
}

/** Return shape of the `useTimeCalendarTileData` orchestrator hook (per-day). */
export interface UseTimeCalendarTileDataResult {
  monthLabel: string
  monthCells: MonthGridCell[]
  weekdayHeaders: readonly string[]
  weekNumber: number
  dayOfYear: number
  year: number
  use24Hour: boolean
  toggleClockFormat: () => void
}
