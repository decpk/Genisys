/**
 * Tailwind class constants for `DndRangeRow`. Mirrors the row styling
 * from `ThemeScheduleRangeRow` so DND rows feel native alongside auto-
 * theme rows.
 */
export const STYLES = {
  row: 'group flex items-center gap-2.5 rounded-lg px-3 py-2 bg-secondary/30 hover:bg-secondary/50 transition-colors',
  index: 'text-[10px] font-medium text-muted-foreground/70 w-4 shrink-0',
  arrow: 'size-3 text-muted-foreground/50 shrink-0',
  overnightBadge:
    'ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-info/10 text-info shrink-0',
  removeButton:
    'h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0',
} as const
