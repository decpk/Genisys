export interface MonthCalendarProps {
  now: Date
}

export interface MonthCalendarCell {
  /** ISO date key, e.g. "2026-05-19" — stable for memoization & keys */
  key: string
  /** Day-of-month label, e.g. "1", "29" */
  label: string
  /** True if this cell belongs to the current month (not adjacent month padding) */
  isCurrentMonth: boolean
  /** True if this cell represents today */
  isToday: boolean
}

export interface MonthCalendarData {
  /** e.g. "May 2026" — pre-formatted month + year heading */
  monthYearLabel: string
  /** 7 short weekday labels in display order, e.g. ["Sun","Mon",...,"Sat"] */
  weekdayLabels: string[]
  /** 42 cells (6 weeks × 7 days) — always exactly 42 for stable layout */
  cells: MonthCalendarCell[]
}
