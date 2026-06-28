export const STYLES = {
  pickButton:
    'mt-1 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-input bg-secondary/30 px-3 py-4 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground',
  chip:
    'mt-1 flex items-center justify-between gap-2 rounded-lg border border-input bg-secondary/40 px-3 py-2',
  chipLeft: 'flex min-w-0 items-center gap-2',
  chipName: 'truncate text-xs text-foreground',
  clearButton:
    'flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
} as const
