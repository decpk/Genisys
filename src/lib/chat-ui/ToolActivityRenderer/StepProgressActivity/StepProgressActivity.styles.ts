/**
 * Visual tokens for a single step row in the VS Code-style timeline.
 * Kept separate from the parent list's styles for testability and reuse.
 */
export const stepProgressActivityStyles = {
  // Row container — used as the timeline anchor
  row: 'relative flex items-center gap-1 px-0.5 py-0.5',

  // Vertical connector line between steps
  connector:
    'absolute left-[7px] top-[18px] bottom-[-2px] w-px bg-border/40 pointer-events-none',

  // Numbered indicator circle on the left
  indicator:
    'shrink-0 relative z-10 flex h-3 w-3 items-center justify-center rounded-full border bg-background',
  indicatorPending: 'border-border/60 text-muted-foreground/60',
  indicatorRunning: 'border-primary/40 bg-primary/10 text-primary',
  indicatorDone: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  indicatorError: 'border-destructive/40 bg-destructive/10 text-destructive',
  indicatorNumber: 'text-[8px] font-mono font-medium tabular-nums leading-none',

  // Content (label + args + chevron + result)
  content: 'min-w-0 flex-1 flex flex-col gap-0',
  contentRow: 'flex items-center gap-1.5 text-[11px] w-full text-left transition-colors leading-tight',
  contentRowInteractive: 'cursor-pointer hover:text-foreground',
  contentRowStatic: 'cursor-default',
  contentRowPending: 'text-muted-foreground/60',
  contentRowRunning: 'text-foreground',
  contentRowDone: 'text-foreground/85',
  contentRowError: 'text-destructive',

  label: 'font-medium truncate',
  args: 'text-muted-foreground/65 truncate text-[10px] font-mono',
  resultChevron:
    'shrink-0 ml-auto text-muted-foreground/50 transition-transform duration-150',
  resultChevronOpen: 'rotate-90',
  result:
    'mt-0.5 text-[10.5px] leading-4 text-muted-foreground/85 bg-muted/40 rounded p-1.5 overflow-auto whitespace-pre-wrap font-mono max-h-[220px]',
} as const
