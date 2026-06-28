export const STATS_TREND_AREA_STYLES = {
  section: 'flex flex-col gap-2 px-3 py-3 border-b border-border/40',
  header:
    'flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground',
  headerLeft: 'flex items-center gap-1.5',
  headerRight: 'text-[9px] normal-case tracking-normal text-muted-foreground/70',
  empty: 'text-[10px] text-muted-foreground',
  chartWrap: 'w-full',
} as const

export const STATS_TREND_AREA_CHART = {
  height: 120,
  gradientId: 'statsTrendAreaGradient',
  gridStroke: 'color-mix(in srgb, var(--color-border) 30%, transparent)',
  axisColor: 'var(--color-muted-foreground)',
  refLineColor: 'var(--color-muted-foreground)',
} as const
