export const STATS_TAG_SHARE_DONUT_STYLES = {
  section: 'flex flex-col gap-2 px-3 py-3 border-b border-border/40',
  header:
    'flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground',
  body: 'flex items-center gap-3',
  donutWrap: 'shrink-0',
  legendWrap: 'flex-1 flex flex-col gap-1',
  empty: 'text-[10px] text-muted-foreground',
} as const

export const STATS_TAG_SHARE_DONUT_CHART = {
  size: 96,
  innerRadius: 26,
  outerRadius: 44,
  paddingAngle: 2,
} as const
