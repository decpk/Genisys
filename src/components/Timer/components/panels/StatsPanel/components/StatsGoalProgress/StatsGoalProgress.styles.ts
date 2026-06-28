/**
 * Tailwind class constants for `StatsGoalProgress`. Keeping these here keeps
 * the JSX in `StatsGoalProgress.tsx` purely declarative.
 */
export const STATS_GOAL_PROGRESS_STYLES = {
  section: 'flex flex-col gap-3 px-3 py-3 border-b border-border/40',
  header:
    'flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground',
  body: 'flex items-center gap-3',
  ringWrap: 'shrink-0',
  rightCol: 'flex-1 flex flex-col gap-2',
  rowLabel: 'flex items-center justify-between text-[10px]',
  rowLabelText: 'text-muted-foreground uppercase tracking-wider font-semibold',
  rowLabelValue: 'tabular-nums text-foreground font-medium',
} as const
