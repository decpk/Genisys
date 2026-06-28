export const CALENDAR_CONTAINER =
  'flex w-full max-w-xl flex-col gap-6 px-8'

export const CALENDAR_HEADER =
  'text-[clamp(1.5rem,2.6vw,2.75rem)] font-light tracking-tight text-foreground/90'

export const WEEKDAY_ROW =
  'grid grid-cols-7 gap-1 text-[clamp(0.7rem,0.85vw,0.95rem)] font-medium uppercase tracking-[0.15em] text-muted-foreground/60'

export const WEEKDAY_CELL = 'flex h-8 items-center justify-center'

export const DAY_GRID = 'grid grid-cols-7 gap-1'

export const DAY_CELL_BASE =
  'flex aspect-square items-center justify-center rounded-full text-[clamp(0.95rem,1.3vw,1.5rem)] font-light tabular-nums transition-colors'

export const DAY_CELL_CURRENT_MONTH = 'text-foreground/85'

export const DAY_CELL_ADJACENT_MONTH = 'text-muted-foreground/25'

// Shadow omitted: `--color-primary-rgb` is not defined in src/assets/main.css,
// so we use the simpler primary background per spec.
export const DAY_CELL_TODAY = 'bg-primary text-primary-foreground font-medium'
