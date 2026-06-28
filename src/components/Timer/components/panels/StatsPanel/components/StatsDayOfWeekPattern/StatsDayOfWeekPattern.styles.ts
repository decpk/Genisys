export const STATS_DAY_OF_WEEK_PATTERN_STYLES = {
  section: 'flex flex-col gap-2 px-3 py-3 border-b border-border/40',
  header:
    'flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground',
  headerLeft: 'flex items-center gap-1.5',
  headerRight:
    'flex items-center gap-1 text-[9px] normal-case tracking-normal text-muted-foreground/70',
  empty: 'text-[10px] text-muted-foreground',
  chartWrap: 'w-full',
} as const

export const STATS_DAY_OF_WEEK_PATTERN_CHART = {
  height: 110,
  gridStroke: 'color-mix(in srgb, var(--color-border) 30%, transparent)',
  axisColor: 'var(--color-muted-foreground)',
} as const
