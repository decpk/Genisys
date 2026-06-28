export const STATS_TAG_SHARE_DONUT_LEGEND_STYLES = {
  list: 'flex flex-col gap-1',
  row: 'flex items-center gap-1.5 text-[10px]',
  swatch: 'size-2 rounded-full shrink-0',
  label: 'text-muted-foreground truncate flex-1',
  pct: 'tabular-nums text-foreground font-medium w-10 text-right',
  minutes:
    'tabular-nums text-muted-foreground/80 w-10 text-right shrink-0',
} as const

const MAX_LEGEND_ROWS = 5

export const STATS_TAG_SHARE_DONUT_LEGEND_CONFIG = {
  maxRows: MAX_LEGEND_ROWS,
} as const
