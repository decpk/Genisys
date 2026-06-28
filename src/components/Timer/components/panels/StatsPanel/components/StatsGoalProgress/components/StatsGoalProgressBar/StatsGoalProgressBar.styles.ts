export const STATS_GOAL_PROGRESS_BAR_STYLES = {
  wrap: 'flex flex-col gap-1',
  topRow: 'flex items-center justify-between text-[10px]',
  label:
    'text-muted-foreground uppercase tracking-wider font-semibold',
  value: 'tabular-nums text-foreground font-medium',
  track: 'h-2 rounded-full bg-accent/30 overflow-hidden',
  fill: 'h-full bg-primary transition-[width] duration-500',
} as const
