/**
 * Class-name constants for the Time & Calendar month grid.
 * Clean and minimal: plain numerals with a clear type hierarchy, soft weekend
 * tone (no fill), faint other-month days, and a flat solid primary marker for
 * the current day — no gradients, rings, or glow.
 */
export const TIME_CALENDAR_MONTH_GRID_STYLES = {
  wrap: 'mt-2 flex-1 flex flex-col',

  weekdayRow: 'grid grid-cols-7 mb-2',
  weekdayCell:
    'text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70',
  /** Weekend (Sat/Sun) header columns — lighter to flag the weekend. */
  weekdayCellWeekend:
    'text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground/40',

  dayGrid: 'grid grid-cols-7 grid-rows-6 gap-1 flex-1',

  /** Base day cell — stretches to fill its grid row. */
  dayCell:
    'flex items-center justify-center rounded-md text-[12px] tabular-nums ' +
    'text-foreground/75 transition-colors',

  /** Day belonging to an adjacent month (leading/trailing). */
  dayCellMuted: 'text-muted-foreground/30',

  /** Weekend (Sat/Sun) day in the current month — softly muted, no fill. */
  dayCellWeekend: 'text-muted-foreground/55',

  /** The current real-world day — clean solid primary marker. */
  dayCellToday: 'bg-primary text-primary-foreground font-semibold',
} as const
