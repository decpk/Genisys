export const STATS_GOAL_PROGRESS_RING_STYLES = {
  wrap: 'relative inline-flex items-center justify-center',
  track: 'stroke-muted/40',
  progress: 'stroke-primary transition-[stroke-dashoffset] duration-500',
  centerWrap:
    'absolute inset-0 flex flex-col items-center justify-center gap-0 leading-none',
  centerLabel: 'text-sm font-semibold tabular-nums text-foreground',
  centerSub: 'text-[8px] uppercase tracking-wider text-muted-foreground',
} as const
