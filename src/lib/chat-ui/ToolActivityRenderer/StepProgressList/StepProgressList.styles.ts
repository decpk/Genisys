/**
 * Visual tokens for the VS Code-style step progress timeline.
 * Kept in this dedicated file per `.claude.md` (presentation layer).
 */
export const stepProgressListStyles = {
  root: 'my-1.5 rounded-md border border-border/40 bg-muted/15 overflow-hidden',

  // Header
  header:
    'w-full flex items-center gap-1.5 px-2 py-1 text-[11px] text-foreground/90 hover:bg-muted/30 transition-colors cursor-pointer',
  headerChevron: 'shrink-0 transition-transform duration-150 text-muted-foreground/70',
  headerChevronOpen: 'rotate-90',
  headerStatusIconRunning: 'shrink-0 text-primary',
  headerStatusIconDone: 'shrink-0 text-emerald-500',
  headerStatusIconError: 'shrink-0 text-destructive',
  headerTitle: 'font-medium flex-1 truncate text-left',
  headerCount:
    'shrink-0 tabular-nums text-[9.5px] font-mono text-muted-foreground/70 px-1 py-px rounded bg-muted/40 border border-border/30',

  // Progress bar (under header)
  progressTrack: 'h-px w-full bg-muted/40 overflow-hidden',
  progressFill:
    'h-full bg-primary/70 transition-[width] duration-300 ease-out',
  progressFillDone: 'bg-emerald-500/70',
  progressFillError: 'bg-destructive/70',

  // Timeline body
  body: 'border-t border-border/30 px-1.5 py-0.5',
  bodyEmpty: 'hidden',
} as const
