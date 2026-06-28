export const sectionProgressBarStyles = {
  container: 'flex items-center gap-2 shrink-0',
  track:
    'relative h-1.5 rounded-full bg-muted/60 ring-1 ring-inset ring-border/30 overflow-hidden w-32',
  fill:
    'h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-[0_0_8px_-1px_rgba(16,185,129,0.55)] transition-[width] duration-500',
  fillComplete: 'animate-pulse',
  label: 'text-[10.5px] font-medium text-muted-foreground tabular-nums',
} as const
